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

	if data == nil {
		return nil, errors.New("No data was found for " + id)
	}

	return &Apart{
		Description: data.description,
		Reserved:    getReservedDaysList(data.reservations, s.c),
		Calendar:    getCalendar(data, s.c),
		MinStays:    data.minStays,
		UnitId:      data.Unit.Id,
		ImageURLs:   data.Unit.Property.ImageUrls,
		Name:        id,
	}, nil
}

type ApartData struct {
	description, reservations, minStays string

	Unit struct {
		Id                   string `json:"id"`
		AvailabilityCalendar struct {
			Calendar map[string]Reservation `json:"calendar"`
		} `json:"availabilityCalendar"`
		Property struct {
			ImageUrls []string `json:"imageUrls"`
		} `json:"property"`
	} `json:"unit"`
}

func scrapApartData(id string, c appengine.Context) (*ApartData, error) {
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

	// query second body script and scrap inner text
	// TODO: not very robust
	data := doc.Find(".body-inner").First().Text()

	// all apart data
	var pageData = regexp.MustCompile(`\'pageData\', \[\], function\(\) \{\n\s+return\s+({.*})`).FindStringSubmatch(data)[1]
	var apartData = getApartData(pageData, c)
	apartData.description = strings.TrimSpace(doc.Find(".property-title").First().Text())
	apartData.reservations = regexp.MustCompile(`var calendarAvailabilityJSON\s+=\s+({.*})`).FindStringSubmatch(data)[1]
	apartData.minStays = regexp.MustCompile(`var calendarMinStayJSON\s+=\s+({.*})`).FindStringSubmatch(data)[1]

	return apartData, nil
}

func getApartData(encodedData string, c appengine.Context) *ApartData {
	var data = &ApartData{}
	if e := json.Unmarshal([]byte(encodedData), data); e != nil {
		c.Debugf("unmarshaling error %v", e)
	}
	return data
}

func getReservedDaysList(encodedData string, c appengine.Context) []string {
	var data map[string]interface{}

	if e := json.Unmarshal([]byte(encodedData), &data); e != nil {
		c.Debugf("unmarshaling error %v", e)
	}

	// extract keys
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	c.Debugf("get reserved days list %+v", keys)
	return keys
}

func getCalendar(apart *ApartData, c appengine.Context) []Reservation {
	calendar := apart.Unit.AvailabilityCalendar.Calendar
	reservations := make([]Reservation, 0, len(calendar))
	for _, res := range calendar {
		reservations = append(reservations, res)
	}
	c.Debugf("get calendar %+v", reservations)
	return reservations
}
