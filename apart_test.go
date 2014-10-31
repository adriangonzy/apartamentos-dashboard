package dashboard

import (
	"reflect"
	"testing"

	"appengine/aetest"
	"appengine/datastore"
)

const (
	testApart = &Apart{
		Reserved:    "{}",
		Data:        "{}",
		UnitId:      "",
		Name:        "42",
		Description: "",
	}
)

func TestGetApart(t *testing.T) {
	c, err := aetest.NewContext(nil)
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()

	/* --- FOUND APART --- */
	// add test apart
	key := datastore.NewKey(c, "Apart", testApart.Name, 0, nil)
	if _, e = datastore.Put(c, key, testApart); e != nil {
		t.Fatal(e)
	}

	foundApart, err := getApart(testApart.Name, c)

	if !reflect.DeepEqual(foundApart, testApart) || err != nil {
		t.Errorf("getApart() = apart %+v, err %+v want apart %+v, err nil", foundApart, err, testApart)
	}

	/* --- NOT FOUND APART --- */
	notFoundApart, err := getApart("not_found", c)
	t.Log(err)
	if notFoundApart != nil {
		t.Errorf("apart should be %+v is %+v for id %+v", nil, notFoundApart, "not_found")
	}
	if err == nil {
		t.Errorf("err should be %+v is %+v", datastore.ErrNoSuchEntity, err)
	}
}

func TestCreateOrUpdateApart(t *testing.T) {

}

func TestDeleteApart(t *testing.T) {

}

func TestApartsList(t *testing.T) {

}

func TestUpdateAparts(t *testing.T) {

}

func TestUpdateAllAparts(t *testing.T) {

}
