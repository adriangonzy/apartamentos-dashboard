package dashboard

import (
	"appengine"
	"encoding/json"
	"github.com/gorilla/mux"
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

	// /rest/apart
	apartRouter := r.PathPrefix("/rest/apart").Subrouter()
	apartRouter.HandleFunc("/", getApartsHandler).Methods("GET")
	apartRouter.HandleFunc("/", updateAllApartsHandler).Methods("PUT")

	// /rest/apart/id/
	apartCRUD := apartRouter.PathPrefix("/{id}").Subrouter()
	apartCRUD.HandleFunc("/", crudHandler(GetApart)).Methods("GET")
	apartCRUD.HandleFunc("/", crudHandler(DeleteApart)).Methods("DELETE")
	apartCRUD.HandleFunc("/", crudHandler(scrap(CreateApart))).Methods("POST")
	apartCRUD.HandleFunc("/", crudHandler(scrap(UpdateApart))).Methods("PUT")

	/** TEST ONLY */

	// /rest/apart/fill
	apartRouter.HandleFunc("/fill", fillApartsHandler).Methods("PUT")

	/** TEST ONLY */

	http.Handle("/", r)
}

func getApartsHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := GetAparts(c)
	response(w, aparts, e)
}

func updateAllApartsHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := UpdateAllAparts(c, NewApartScrapper(c))
	response(w, aparts, e)
}

func fillApartsHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := UpdateAparts(apartIDs, c, NewApartScrapper(c))
	response(w, aparts, e)
}

func crudHandler(crudFunc func(id string, c appengine.Context) (*Apart, error)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		c := appengine.NewContext(r)
		vars := mux.Vars(r)
		id := vars["id"]
		apart, e := crudFunc(id, c)
		response(w, apart, e)
	}
}

func scrap(editingFunc func(*Apart, appengine.Context) (*Apart, error)) func(string, appengine.Context) (*Apart, error) {
	return func(id string, c appengine.Context) (*Apart, error) {
		if apart, e := NewApartScrapper(c).Scrap(id); e != nil {
			return nil, e
		} else {
			return editingFunc(apart, c)
		}
	}
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
