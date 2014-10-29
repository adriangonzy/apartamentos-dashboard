package dashboard

import (
	"encoding/json"
	"errors"
	"regexp"
	"strings"

	"appengine"
	"appengine/urlfetch"

	"github.com/PuerkitoBio/goquery"
)

const HOMELIDAYS_APART_URL = "http://www.homelidays.com/hebergement/p"

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

	description := strings.TrimSpace(doc.Find(".property-title").First().Text())

	// query second body script and scrap inner text
	// TODO: check that first is not poisonous
	data := doc.Find(".body-inner > script").Eq(1).Text()

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
