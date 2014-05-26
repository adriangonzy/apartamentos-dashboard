package dashboard

import (
	"fmt"
	"net/http"

	"regexp"
	"errors"

	"encoding/json"

	"appengine"
	"appengine/urlfetch"
    "appengine/datastore"

	"github.com/PuerkitoBio/goquery"
)

type Apart struct {
	data string
	Reserved []byte `json:",string"`
	Data []byte `json:",string"`
	UnitId string 
	Name string
}

func init() {
	http.HandleFunc("/rest/apart", apartRouter)
}

func apartRouter(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	switch r.Method {
	   case "POST":
	       // Serve the resource.
	   case "GET":
	   		// scrap apart data
	   		apart, e := newApart(r, c)

	   		if e != nil {	
	   			http.Error(w, e.Error(), http.StatusInternalServerError)
	   		}
			
			// add apart to datastore
			key := datastore.NewKey(c, "Apart", apart.Name, 0, nil)
	   		_, e = datastore.Put(c, key, &apart)
	   		if e != nil {
	   			http.Error(w, e.Error(), http.StatusInternalServerError)
	   		}

	   		var test Apart

			if err := datastore.Get(c, key, &test); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}

			res, e := json.Marshal(test)
			if e != nil {
				http.Error(w, e.Error(), http.StatusInternalServerError)
			}

			fmt.Fprint(w, string(res))

	   case "PUT":
	       // Update an existing record.
	   case "DELETE":
	       // Remove the record.
	   default:
	       // Give an error message.
	}
}

func newApart(r *http.Request, c appengine.Context) (Apart, error) {

	values := r.URL.Query()
	id := values.Get("apart_id")

	emptyApart := Apart{[]byte{}, []byte{}, "", ""}

	if id == "" {
		return emptyApart, errors.New("Must provide an apart_id parameter")
	}

	data, e := scrapApartData(id, c)
	if 	e != nil {
		c.Errorf("%v", e)
		return emptyApart, e
	}

	if  len(data) == 0 {
		return emptyApart, errors.New("No data was found for " + id)
	}

	return Apart{
		Reserved: []byte(data[0]),
		Data: []byte(data[2]),
		UnitId: getUnitId(data[2]),
		Name: id,
	}, nil
}

const HOMELIDAYS_APART_URL = "http://www.homelidays.com/hebergement/p"

func getUnitId(encodedData string) string {
	var data map[string]interface{}
		
    if err := json.Unmarshal([]byte(encodedData), &data); err != nil {
        panic(err)
    }

    return data["unitId"].(string)
}

func scrapApartData(id string, c appengine.Context) ([]string, error) {
	var resp *http.Response
	var doc *goquery.Document
	var e error

	url := HOMELIDAYS_APART_URL + id

	if resp, e = urlfetch.Client(c).Get(url); e != nil {
		c.Errorf("%v", e)
		return nil, e
	}

	if doc, e = goquery.NewDocumentFromResponse(resp); e != nil {
		c.Errorf("%v", e)
		return nil, e
	}

	// Parse first body script text
	data := doc.Find("body > script").First().Text()
	jsondata := regexp.MustCompile("{\".*}}")

	return jsondata.FindAllString(data, 3), nil
}
