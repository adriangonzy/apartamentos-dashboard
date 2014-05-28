package dashboard

import (
	"net/http"

	"errors"
	"regexp"

	"encoding/json"

	"appengine"
	"appengine/datastore"
	"appengine/urlfetch"

	"github.com/PuerkitoBio/goquery"
)

type Apart struct {
	Reserved string `datastore:",noindex" json:"reserved"`
	Data     string `datastore:",noindex" json:"data"`
	UnitId   string `json:"unit_id"`
	Name     string `json:"id"`
}

func init() {
	http.HandleFunc("/rest/apart", apartRouter)
	// look up gorilla
}

func apartRouter(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	switch r.Method {
	case "POST":
		// scrap apart data
		apart, e := fetchApartData(r, c)
		if e != nil {
			http.Error(w, e.Error(), http.StatusBadRequest)
			return
		}

		// create new apart key
		key := datastore.NewKey(c, "Apart", apart.Name, 0, nil)

		// save new apart to datastore
		_, e = datastore.Put(c, key, apart)
		if e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}

		// write json encoded apart to the response
		if e := json.NewEncoder(w).Encode(apart); e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}
	case "GET":

		id := r.URL.Query().Get("apart_id")
		if id == "" {
			http.Error(w, errors.New("Must provide an apart_id parameter").Error(), http.StatusInternalServerError)
			return
		}

		key := datastore.NewKey(c, "Apart", id, 0, nil)

		// load apart from datastore
		var apart Apart
		if e := datastore.Get(c, key, &apart); e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}

		// write json encoded apart to the response
		if e := json.NewEncoder(w).Encode(apart); e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}

	case "PUT":
	case "DELETE":
	default:
	}
}

func fetchApartData(r *http.Request, c appengine.Context) (*Apart, error) {

	id := r.URL.Query().Get("apart_id")
	if id == "" {
		return nil, errors.New("Must provide an apart_id parameter")
	}

	data, e := scrapApartData(id, c)
	if e != nil {
		c.Errorf("scrap data %v", e)
		return nil, e
	}

	if data == nil || len(data) == 0 {
		return nil, errors.New("No data was found for " + id)
	}

	return &Apart{
		Reserved: data[0],
		Data:     data[2],
		UnitId:   getUnitId(data[2], c),
		Name:     id,
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

	// parse first 3 json maps using capture groups
	subMatches := regexp.MustCompile(`({".*})\s*;`).FindAllStringSubmatch(data, -1)

	if len(subMatches) < 3 {
		return nil, errors.New("referencia " + id + " es invalida.")
	}

	apartData := make([]string, 3)
	apartData[0] = subMatches[0][1]
	apartData[1] = subMatches[1][1]
	apartData[2] = subMatches[2][1]

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
