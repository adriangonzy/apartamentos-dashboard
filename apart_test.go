package dashboard

import (
	"reflect"
	"testing"

	"appengine/aetest"
	"appengine/datastore"
)

var testApart *Apart = &Apart{
	Reserved:    "{}",
	Data:        "{}",
	UnitId:      "",
	Name:        "42",
	Description: "",
}

// http://blog.golang.org/appengine-dec2013

func aeContext(t *testing.T) aetest.Context {
	c, err := aetest.NewContext(nil)
	if err != nil {
		t.Fatal(err)
	}
	return c
}

func TestGetApartFound(t *testing.T) {

	// add test apart
	key := datastore.NewKey(c, "Apart", testApart.Name, 0, nil)
	if _, e := datastore.Put(c, key, testApart); e != nil {
		t.Fatal(e)
	}

	foundApart, err := getApart(testApart.Name, c)

	if !reflect.DeepEqual(foundApart, testApart) || err != nil {
		t.Errorf("getApart() = apart %+v, err %+v want apart %+v, err nil", foundApart, err, testApart)
	}
}

func TestGetApartNotFound(t *testing.T) {
	c := aeContext(t)
	defer c.Close()

	notFoundApart, err := getApart("not_found", c)
	if notFoundApart != nil {
		t.Errorf("getApart() = apart %+v, err %+v want apart nil, err %+v", notFoundApart, err, datastore.ErrNoSuchEntity)
	}
}

func TestCreateApart(t *testing.T) {
	c := aeContext(t)
	defer c.Close()

	apart, e := createApart(testApart, c)

	if !reflect.DeepEqual(apart, testApart) || e != nil {
		t.Errorf("createApart() = apart %+v, err %+v want apart %+v, err nil", apart, e, testApart)
	}
}

func TestUpdateApart(t *testing.T) {
	c := aeContext(t)
	defer c.Close()

	// add test apart
	key := datastore.NewKey(c, "Apart", testApart.Name, 0, nil)
	if _, e := datastore.Put(c, key, testApart); e != nil {
		t.Fatal(e)
	}

	update := &Apart{
		Reserved:    "{\"test\":\"test\"}",
		Data:        "{\"test\":\"test\"}",
		UnitId:      "test",
		Name:        testApart.Name,
		Description: "updated description",
	}

	apart, e := updateApart(update, c)

	if !reflect.DeepEqual(apart, update) || e != nil {
		t.Errorf("updateApart() = apart %+v, err %+v want apart %+v, err nil", apart, e, update)
	}
}
