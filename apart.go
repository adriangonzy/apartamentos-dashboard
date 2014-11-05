package dashboard

import (
	"errors"
	"sync"

	"appengine"
	"appengine/datastore"
)

type Apart struct {
	Description string `datastore:",noindex" json:"description"`
	Reserved    string `datastore:",noindex" json:"reserved"`
	Data        string `datastore:",noindex" json:"data"`
	MinStays    string `datastore:",noindex" json:"minstays"`
	UnitId      string `json:"unit_id"`
	Name        string `json:"id"`
}

func UpdateAllAparts(c appengine.Context, scrapper ApartScrapper) ([]*Apart, error) {
	aparts, e := GetAparts(c)
	if e != nil {
		return nil, e
	}

	ids := []string{}
	for _, apart := range aparts {
		ids = append(ids, apart.Name)
	}

	return UpdateAparts(ids, c, scrapper)
}

func concatError(oldErr error, newErr error) error {
	switch {
	case newErr == nil:
		return oldErr
	case oldErr == nil:
		return newErr
	case oldErr != nil:
		return errors.New(oldErr.Error() + "\n" + newErr.Error())
	default:
		return nil
	}
}

func UpdateAparts(ids []string, c appengine.Context, scrapper ApartScrapper) ([]*Apart, error) {
	aparts := []*Apart{}
	// concurrently update aparts
	var e error
	var wg sync.WaitGroup
	wg.Add(len(ids))
	for _, id := range ids {
		go func(id string) {
			if apart, er := scrapper.Scrap(id); er != nil {
				e = concatError(e, er)
			} else {
				if updated, err := UpdateApart(apart, c); err != nil {
					e = concatError(e, err)
				} else {
					aparts = append(aparts, updated)
				}
			}
			wg.Done()
		}(id)
	}
	wg.Wait()
	return aparts, e
}

func GetAparts(c appengine.Context) ([]*Apart, error) {
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
	for i := range aparts {
		apartPointers[i] = &aparts[i]
	}

	return apartPointers, nil
}

func GetApart(id string, c appengine.Context) (*Apart, error) {
	key := datastore.NewKey(c, "Apart", id, 0, nil)

	// load apart from datastore
	var apart Apart
	if e := datastore.Get(c, key, &apart); e != nil {
		return nil, e
	}
	return &apart, nil
}

func DeleteApart(id string, c appengine.Context) (*Apart, error) {
	key := datastore.NewKey(c, "Apart", id, 0, nil)
	return nil, datastore.Delete(c, key)
}

func UpdateApart(apart *Apart, c appengine.Context) (*Apart, error) {
	// TODO: should check that apart exists
	return CreateApart(apart, c)
}

func CreateApart(apart *Apart, c appengine.Context) (*Apart, error) {
	// create new apart key
	key := datastore.NewKey(c, "Apart", apart.Name, 0, nil)

	// save new apart to datastore
	_, e := datastore.Put(c, key, apart)
	if e != nil {
		return nil, e
	}

	return apart, nil
}
