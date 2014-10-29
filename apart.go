package dashboard

import (
	"errors"
	"sync"

	"appengine"
	"appengine/datastore"
)

type Apart struct {
	Reserved    string `datastore:",noindex" json:"reserved"`
	Data        string `datastore:",noindex" json:"data"`
	UnitId      string `json:"unit_id"`
	Name        string `json:"id"`
	Description string `json:"description"`
}

func updateAllAparts(c appengine.Context) ([]*Apart, error) {
	aparts, e := apartsList(c)
	if e != nil {
		return nil, e
	}

	ids := []string{}
	for _, apart := range aparts {
		ids = append(ids, apart.Name)
	}

	return updateAparts(ids, c)
}

func updateAparts(ids []string, c appengine.Context) ([]*Apart, error) {
	aparts := []*Apart{}
	// concurrently update aparts
	var e error
	var wg sync.WaitGroup
	wg.Add(len(ids))
	for _, id := range ids {
		go func(id string) {
			if updated, err := createOrUpdateApart(id, c); err != nil {
				if e != nil {
					e = errors.New(e.Error() + "\n" + err.Error())
				} else {
					e = err
				}
			} else {
				aparts = append(aparts, updated)
			}
			wg.Done()
		}(id)
	}
	wg.Wait()
	return aparts, e
}

func apartsList(c appengine.Context) ([]*Apart, error) {
	// fetch apart keys
	apartKeys := []*datastore.Key{}
	q := datastore.NewQuery("Apart")
	for t := q.Run(c); ; {
		var a Apart
		key, err := t.Next(&a)
		if err == datastore.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		apartKeys = append(apartKeys, key)
	}

	// batch load aparts from keys
	aparts := make([]Apart, len(apartKeys))
	if e := datastore.GetMulti(c, apartKeys, aparts); e != nil {
		return nil, e
	}

	apartPointers := make([]*Apart, len(apartKeys))
	for i, apart := range aparts {
		apartPointers[i] = &apart
	}

	return apartPointers, nil
}

func getApart(id string, c appengine.Context) (*Apart, error) {
	key := datastore.NewKey(c, "Apart", id, 0, nil)

	// load apart from datastore
	var apart Apart
	if e := datastore.Get(c, key, &apart); e != nil {
		return nil, e
	}
	return &apart, nil
}

func deleteApart(id string, c appengine.Context) (*Apart, error) {
	key := datastore.NewKey(c, "Apart", id, 0, nil)
	return nil, datastore.Delete(c, key)
}

func createOrUpdateApart(id string, c appengine.Context) (*Apart, error) {

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
