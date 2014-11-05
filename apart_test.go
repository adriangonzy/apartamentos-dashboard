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

func TestCRUDApart(t *testing.T) {
	c, err := aetest.NewContext(nil)
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()

	// create Apart
	apart, e := CreateApart(testApart, c)
	if !reflect.DeepEqual(apart, testApart) || e != nil {
		t.Errorf("CreateApart() = apart %+v, err %+v want apart %+v, err nil", apart, e, testApart)
	}

	// get apart found
	foundApart, e := GetApart(testApart.Name, c)
	if !reflect.DeepEqual(foundApart, testApart) || e != nil {
		t.Errorf("GetApart() = apart %+v, err %+v want apart %+v, err nil", foundApart, e, testApart)
	}

	// update apart
	update := &Apart{
		Reserved:    "{\"test\":\"test\"}",
		Data:        "{\"test\":\"test\"}",
		UnitId:      "test",
		Name:        testApart.Name,
		Description: "updated description",
	}

	updatedApart, e := UpdateApart(update, c)
	if !reflect.DeepEqual(updatedApart, update) || e != nil {
		t.Errorf("UpdateApart() = apart %+v, err %+v want apart %+v, err nil", updatedApart, e, update)
	}

	// delete apart
	deletedApart, e := DeleteApart(testApart.Name, c)
	if e != nil {
		t.Errorf("DeleteApart() = apart %+v, err %+v want apart nil, err nil", deletedApart, e)
	}

	// get apart not found
	notFoundApart, err := GetApart(testApart.Name, c)
	if notFoundApart != nil {
		t.Errorf("GetApart() = apart %+v, err %+v want apart nil, err %+v", notFoundApart, err, datastore.ErrNoSuchEntity)
	}
}

func contains(aparts []*Apart, apart *Apart) bool {
	for _, a := range aparts {
		if a.Name == apart.Name {
			return true
		}
	}
	return false
}

func TestGetAparts(t *testing.T) {
	c, err := aetest.NewContext(&aetest.Options{StronglyConsistentDatastore: true})
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()

	// init 2 aparts
	apart1, e := CreateApart(testApart, c)
	if e != nil {
		t.Error(e)
	}
	apart2, e := CreateApart(&Apart{Name: "43"}, c)
	if e != nil {
		t.Error(e)
	}

	aparts, e := GetAparts(c)

	// test size
	if len(aparts) != 2 || e != nil {
		t.Errorf("GetAparts() = aparts %+v, err %+v want len(aparts)=2, err nil", aparts, e)
	}

	if !contains(aparts, apart1) {
		t.Errorf("GetAparts() = aparts %+v does not contain apart1 %+v", aparts, apart1)
	}
	if !contains(aparts, apart2) {
		t.Errorf("GetAparts() = aparts %+v does not contain apart2 %+v", aparts, apart2)
	}
}

type TestScrapper struct {
	desc string
}

func (s *TestScrapper) Scrap(id string) (*Apart, error) {
	return &Apart{Name: id, Description: s.desc}, nil
}

func TestUpdateAparts(t *testing.T) {
	c, err := aetest.NewContext(&aetest.Options{StronglyConsistentDatastore: true})
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()

	// init 2 aparts
	apart1, e := CreateApart(testApart, c)
	if e != nil {
		t.Error(e)
	}
	apart2, e := CreateApart(&Apart{Name: "43"}, c)
	if e != nil {
		t.Error(e)
	}

	aparts, e := UpdateAparts([]string{"42", "43"}, c, &TestScrapper{"updated"})

	// test size
	if len(aparts) != 2 || e != nil {
		t.Errorf("UpdateAparts() = aparts %+v, err %+v want len(aparts)=2, err nil", aparts, e)
	}

	// test contains
	if !contains(aparts, apart1) {
		t.Errorf("UpdateAparts() = aparts %+v does not contain apart1 %+v", aparts, apart1)
	}
	if !contains(aparts, apart2) {
		t.Errorf("UpdateAparts() = aparts %+v does not contain apart2 %+v", aparts, apart2)
	}

	// test updated
	for _, apart := range aparts {
		if apart.Description != "updated" {
			t.Errorf("UpdateAparts() = apart %+v was not updated", apart)
		}
	}
}

func TestUpdateAllAparts(t *testing.T) {
	c, err := aetest.NewContext(&aetest.Options{StronglyConsistentDatastore: true})
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()

	// init 2 aparts
	apart1, e := CreateApart(testApart, c)
	if e != nil {
		t.Error(e)
	}
	apart2, e := CreateApart(&Apart{Name: "43"}, c)
	if e != nil {
		t.Error(e)
	}

	allAparts, e := UpdateAllAparts(c, &TestScrapper{"all"})

	// test size
	if len(allAparts) != 2 || e != nil {
		t.Errorf("UpdateAllAparts() = aparts %+v, err %+v want len(aparts)=2, err nil", allAparts, e)
	}

	// test contains
	if !contains(allAparts, apart1) {
		t.Errorf("UpdateAllAparts() = aparts %+v does not contain apart1 %+v", allAparts, apart1)
	}
	if !contains(allAparts, apart2) {
		t.Errorf("UpdateAllAparts() = aparts %+v does not contain apart2 %+v", allAparts, apart2)
	}

	// test updated
	for _, apart := range allAparts {
		if apart.Description != "all" {
			t.Errorf("UpdateAllAparts() = apart %+v was not updated", apart)
		}
	}
}

func TestConcatError(t *testing.T) {

}
