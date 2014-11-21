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

type ApartScrapper interface {
	Scrap(id string) (*Apart, error)
}

type SimpleApartScrapper struct {
	c appengine.Context
}

func NewApartScrapper(c appengine.Context) ApartScrapper {
	return &SimpleApartScrapper{c}
}

func (s *SimpleApartScrapper) Scrap(id string) (*Apart, error) {
	data, e := scrapApartData(id, s.c)
	if e != nil {
		s.c.Errorf("scrap data %v", e)
		return nil, e
	}

	if data == nil || len(data) == 0 {
		return nil, errors.New("No data was found for " + id)
	}

	return &Apart{
		Description: data[0],
		Reserved:    data[2],
		MinStays:    data[3],
		UnitId:      data[4],
		Calendar:    data[5],
		ImageURLs:   getImageURLs(data[1], s.c),
		Name:        id,
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

	apartData := make([]string, 6)

	// query second body script and scrap inner text
	// TODO: not very robust
	data := doc.Find(".body-inner > script").Eq(1).Text()

	// description
	apartData[0] = strings.TrimSpace(doc.Find(".property-title").First().Text())
	// all apart data
	apartData[1] = regexp.MustCompile(`var unitJSON\s+=\s+({.*})`).FindStringSubmatch(data)[1]
	// reservations
	apartData[2] = regexp.MustCompile(`var calendarAvailabilityJSON\s+=\s+({.*})`).FindStringSubmatch(data)[1]
	// min stays
	apartData[3] = regexp.MustCompile(`var calendarMinStayJSON\s+=\s+({.*})`).FindStringSubmatch(data)[1]
	// unit ID
	apartData[4] = getUnitId(apartData[1], c)
	// calendar
	apartData[5] = getCalendar(apartData[1], c)

	return apartData, nil
}

func getImageURLs(encodedData string, c appengine.Context) []string {
	var data struct {
		Property struct {
			ImageUrls []string `json:"imageUrls"`
		} `json:"property"`
	}

	if e := json.Unmarshal([]byte(encodedData), &data); e != nil {
		c.Debugf("unmarshaling error %v", e)
	}
	c.Debugf("get image urls %+v", data)

	return data.Property.ImageUrls
}

func getCalendar(encodedData string, c appengine.Context) string {
	var data struct {
		AvailabilityCalendar struct {
			Calendar json.RawMessage `json:"calendar"`
		} `json:"availabilityCalendar"`
	}

	if e := json.Unmarshal([]byte(encodedData), &data); e != nil {
		c.Debugf("unmarshaling error %v", e)
	}
	c.Debugf("get image urls %+v", data)

	calendar, err := json.Marshal(&data.AvailabilityCalendar.Calendar)
	if err != nil {
		c.Debugf("marshaling raw message error %v", err)
	}

	return string(calendar)
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
