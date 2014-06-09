package dashboard

import (
	"net/http"

	"errors"
	"regexp"
	"strings"

	"encoding/json"

	"appengine"
	"appengine/datastore"
	"appengine/urlfetch"

	"github.com/PuerkitoBio/goquery"
)

var apart_ids = []string{
	"6309936",
	"6340214",
	"6340684",
	"6357433",
	"6424249",
	"6428080",
	"6444566",
	"6564225",
	"6569893",
	"6611125",
	"6613087",
	"6617373",
	"6640918",
	"6640931",
	"6640936"}

type Apart struct {
	Reserved    string `datastore:",noindex" json:"reserved"`
	Data        string `datastore:",noindex" json:"data"`
	UnitId      string `json:"unit_id"`
	Name        string `json:"id"`
	Description string `json:"description"`
}

func init() {
	http.HandleFunc("/rest/apart", apartCRUD)
	http.HandleFunc("/rest/apart/list", apartQuery)
	http.HandleFunc("/rest/apart/fill", fillDB)
	// look up gorilla
}

func fillDB(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	aparts := make([]*Apart, len(apart_ids))
	errors := make([]error, len(apart_ids))

	var apart_i, error_i int = 0, 0

	for _, v := range apart_ids {
		apart, e := createApartFromID(v, c)
		if e != nil {
			errors[error_i] = e
			error_i++
			continue
		}
		aparts[apart_i] = apart
		apart_i++
	}

	serialize(w, aparts)
}

func apartQuery(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	apartKeys := []*datastore.Key{}

	q := datastore.NewQuery("Apart")
	for t := q.Run(c); ; {
		var a Apart
		key, err := t.Next(&a)
		if err == datastore.Done {
			break
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		apartKeys = append(apartKeys, key)
	}

	aparts := make([]Apart, len(apartKeys))

	if e := datastore.GetMulti(c, apartKeys, aparts); e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
		return
	}

	serialize(w, aparts)
}

func apartCRUD(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	id := r.URL.Query().Get("apart_id")
	if id == "" {
		http.Error(w, errors.New("Must provide an apart_id parameter").Error(), http.StatusBadRequest)
		return
	}

	switch r.Method {

	case "POST", "PUT":
		apart, e := createApartFromID(id, c)
		if e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}

		serialize(w, apart)
	case "GET":
		apart, e := getApartFromID(id, c)
		if e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}

		serialize(w, apart)
	case "DELETE":
		e := deleteApartFromID(id, c)
		if e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(200)
	default:
	}
}

func serialize(w http.ResponseWriter, v interface{}) {
	if e := json.NewEncoder(w).Encode(v); e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
	}
}

func deleteApartFromID(id string, c appengine.Context) error {
	key := datastore.NewKey(c, "Apart", id, 0, nil)
	return datastore.Delete(c, key)
}

func getApartFromID(id string, c appengine.Context) (*Apart, error) {
	key := datastore.NewKey(c, "Apart", id, 0, nil)

	// load apart from datastore
	var apart Apart
	if e := datastore.Get(c, key, &apart); e != nil {
		return nil, e
	}
	return &apart, nil
}

func createApartFromID(id string, c appengine.Context) (*Apart, error) {

	apart, e := fetchApartData(id, c)
	if e != nil {
		return nil, e
	}

	// create new apart key
	key := datastore.NewKey(c, "Apart", apart.Name, 0, nil)

	// save new apart to datastore
	_, e = datastore.Put(c, key, apart)
	if e != nil {
		return nil, e
	}

	return apart, nil
}

func fetchApartData(id string, c appengine.Context) (*Apart, error) {

	data, e := scrapApartData(id, c)
	if e != nil {
		c.Errorf("scrap data %v", e)
		return nil, e
	}

	if data == nil || len(data) == 0 {
		return nil, errors.New("No data was found for " + id)
	}

	c.Debugf("%v", data[1])

	return &Apart{
		Reserved:    data[0],
		Data:        data[2],
		UnitId:      getUnitId(data[2], c),
		Name:        id,
		Description: data[1],
	}, nil
}

const HOMELIDAYS_APART_URL = "http://www.homelidays.com/hebergement/p"

func scrapApartData(id string, c appengine.Context) ([]string, error) {
	url := HOMELIDAYS_APART_URL + id

	// use appengine url fetch
	resp, e := urlfetch.Client(c).Get(url)
	if e != nil {
		c.Errorf("fetching url %v error %v", url, e)
		return nil, e
	}

	// parse url fetch response for building the dom representation
	doc, e := goquery.NewDocumentFromResponse(resp)
	if e != nil {
		c.Errorf("parsing Dom %v", e)
		return nil, e
	}

	// query first body script and scrap inner text
	// TODO: check that first is not poisonous
	data := doc.Find("body > script").First().Text()

	description := strings.TrimSpace(doc.Find(".property-title").First().Text())

	// parse first 3 json maps using capture groups
	subMatches := regexp.MustCompile(`({".*})\s*;`).FindAllStringSubmatch(data, -1)

	if len(subMatches) < 3 {
		return nil, errors.New("referencia " + id + " es invalida.")
	}

	apartData := make([]string, 3)
	apartData[0] = subMatches[0][1]
	apartData[2] = subMatches[2][1]
	apartData[1] = description

	return apartData, nil
}

func getUnitId(encodedData string, c appengine.Context) string {
	var data map[string]interface{}

	if e := json.Unmarshal([]byte(encodedData), &data); e != nil {
		c.Debugf("unmarshaling error %v", e)
	}

	if data["unitId"] != nil {
		return data["unitId"].(string)
	}
	c.Debugf("no UNIT ID")
	return ""
}
