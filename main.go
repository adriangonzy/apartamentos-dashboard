package dashboard

import (
	"fmt"
	"net/http"
	//"time"

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
	"6617373",
	"6640918",
	"6640936",
}

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
	unitID := getUnitId(data[2], c)

	//scrapApartPrices(id, unitID, c)

	return &Apart{
		Reserved:    data[0],
		Description: data[1],
		Data:        data[2],
		UnitId:      unitID,
		Name:        id,
	}, nil
}

const HOMELIDAYS_BASE_URL = "http://www.homelidays.com"
const HOMELIDAYS_APART_URL = HOMELIDAYS_BASE_URL + "/hebergement/p"
const HOMELIDAYS_APART_PRICES_FMT_URL = HOMELIDAYS_BASE_URL + "/propertyCurrencyChange.htm?systemId=trips&propertyId=%s&uni_id=%s"

var FRENCH_MONTHS_ABBREV = [12]string{"janv", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"}

func monthIndex(value string) int {
	for p, v := range FRENCH_MONTHS_ABBREV {
		if v == value {
			return p + 1
		}
	}
	return -1
}

func scrapApartPrices(id, unitId string, c appengine.Context) error {
	url := fmt.Sprintf(HOMELIDAYS_APART_PRICES_FMT_URL, id, unitId)

	c.Debugf("%v", url)

	resp, e := urlfetch.Client(c).Get(url)
	if e != nil {
		c.Errorf("fetching url %v error %v", url, e)
		return e
	}

	// parse url fetch response for building the dom representation
	doc, e := goquery.NewDocumentFromResponse(resp)
	if e != nil {
		c.Errorf("parsing apart Prices %v", e)
		return e
	}

	//loc, _ := time.LoadLocation("Europe/Paris")

	doc.Find("#rates .ratePeriodLabel").Each(func(i int, s *goquery.Selection) {
		title := s.Find(".ratePeriodTitle").Text()
		dates := s.Find(".ratePeriodDates").First().Text()
		price := strings.TrimSpace(s.Find(".weekly").Text())

		// matches 2 août 2014
		subMatches := regexp.MustCompile(`(\d*)\s*(\p{Latin}*)\.?\s*(\d{4})`).FindAllStringSubmatch(dates, -1)

		if len(subMatches) > 0 {
			parseDates := [6]string{}
			parseDates[0] = subMatches[0][1]
			parseDates[1] = subMatches[0][2]
			parseDates[2] = subMatches[0][3]
			parseDates[3] = subMatches[1][1]
			parseDates[4] = subMatches[1][2]
			parseDates[5] = subMatches[1][3]

			c.Debugf("%s - %s - %s\n", title, parseDates, price)

			/*
				start, e1 := time.ParseInLocation("02 02 2014", parseDates[0], loc)
				end, e2 := time.ParseInLocation("02 02 2014", parseDates[1], loc)

				c.Debugf("%v - %v\n", start, end)
				c.Debugf("%v - %v\n", e1, e2)
			*/
		}

	})

	return nil
}

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

		return nil, e
	}

	// scrap description
	apartData := make([]string, 3)
	apartData[1] = strings.TrimSpace(doc.Find(".property-title").First().Text())

	// scrap reservations and data
	// query first body script and scrap inner text
	// TODO: check that first is not poisonous
	data := doc.Find(".body-inner > script").Eq(1).Text()

	//c.Debugf("%v", data)

	// parse first 3 json maps using capture groups
	subMatches := regexp.MustCompile(`({"?.*})\s*;`).FindAllStringSubmatch(data, -1)

	if len(subMatches) < 3 {
		c.Errorf("referencia "+id+": sin datos de reserva.", e)
	} else {
		apartData[0] = subMatches[0][1]
		apartData[2] = subMatches[2][1]
	}

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
