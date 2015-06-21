package dashboard

import (
	"appengine"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/justinas/alice"
	"net/http"
)

var apartIDs = []string{
	"6309936",
	"6340214",
	"6340684",
	"6357433",
	"6424249",
	"6428080",
	"6444566",
	"6564225",
	"6569893",
	"6611125",
	"6617373",
	"6640918",
	"6640936",
}

func init() {
	r := mux.NewRouter()
	common := alice.New(loggingHandler)

	// /rest/apart
	apartRouter := r.PathPrefix("/rest/apart").Subrouter()
	apartRouter.Handle("/", common.ThenFunc(getAparts)).Methods("GET")
	apartRouter.Handle("/", common.ThenFunc(updateAllAparts)).Methods("PUT")
	apartRouter.Handle("/fill", common.ThenFunc(fillAparts)).Methods("PUT") /** TEST ONLY */

	// /rest/apart/id/
	apartCRUD := apartRouter.PathPrefix("/{id}").Subrouter()
	apartCRUD.Handle("/", common.ThenFunc(crud(GetApart))).Methods("GET")
	apartCRUD.Handle("/", common.ThenFunc(crud(DeleteApart))).Methods("DELETE")
	apartCRUD.Handle("/", common.ThenFunc(crud(scrap(CreateApart)))).Methods("POST")
	apartCRUD.Handle("/", common.ThenFunc(crud(scrap(UpdateApart)))).Methods("PUT")

	http.Handle("/", r)
}

func getAparts(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := GetAparts(c)
	response(w, aparts, e)
}

func updateAllAparts(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := UpdateAllAparts(c, NewApartScrapper(c))
	response(w, aparts, e)
}

func fillAparts(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := UpdateAparts(apartIDs, c, NewApartScrapper(c))
	response(w, aparts, e)
}

type CrudFunc func(string, appengine.Context) (*Apart, error)
type EditingFunc func(*Apart, appengine.Context) (*Apart, error)

func crud(crudFunc CrudFunc) http.HandlerFunc {
	fn := func(w http.ResponseWriter, r *http.Request) {
		c := appengine.NewContext(r)
		vars := mux.Vars(r)
		id := vars["id"]
		apart, e := crudFunc(id, c)
		response(w, apart, e)
	}
	return http.HandlerFunc(fn)
}

func scrap(editingFunc EditingFunc) CrudFunc {
	return CrudFunc(func(id string, c appengine.Context) (*Apart, error) {
		if apart, e := NewApartScrapper(c).Scrap(id); e != nil {
			return nil, e
		} else {
			return editingFunc(apart, c)
		}
	})
}

func response(w http.ResponseWriter, r interface{}, e error) {
	if e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
		return
	}
	serialize(w, r)
}

func serialize(w http.ResponseWriter, v interface{}) {
	if e := json.NewEncoder(w).Encode(v); e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
	}
}
