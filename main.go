package dashboard

import (
	"fmt"
	"net/http"
	"regexp"

	"appengine"
	"appengine/urlfetch"

	"github.com/PuerkitoBio/goquery"
)

func init() {
	http.HandleFunc("/ws", root)
}

func root(w http.ResponseWriter, r *http.Request) {

	var resp *http.Response
	var doc *goquery.Document
	var e error

	url := "http://www.homelidays.com/hebergement/p6640918"
	c := appengine.NewContext(r)

	if resp, e = urlfetch.Client(c).Get(url); e != nil {
		c.Debugf("%v", e)
		http.Error(w, e.Error(), http.StatusInternalServerError)
		return
	}

	if doc, e = goquery.NewDocumentFromResponse(resp); e != nil {
		c.Debugf("%v", e)
		http.Error(w, e.Error(), http.StatusInternalServerError)
		return
	}

	jsondata := regexp.MustCompile("{\".*}}")

	// Parse first body script text
	data := doc.Find("body > script").First().Text()
	loc := jsondata.FindAllString(data, 3)
	c.Debugf("%v", len(loc))
	if len(loc) == 0 {
		return
	}
	fmt.Fprintf(w, "{ \"reserved\":"+loc[0]+", \"minweek\":"+loc[1]+", \"unit\":"+loc[2]+"}")
}
