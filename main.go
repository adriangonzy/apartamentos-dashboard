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
}

func init() {
	r := mux.NewRouter()

	apartRouter := r.PathPrefix("/rest/apart").Subrouter()
	apartRouter.HandleFunc("/", getApartsHandler).Methods("GET")
	apartRouter.HandleFunc("/", updateAllApartsHandler).Methods("PUT")

	// only for testing
	apartRouter.HandleFunc("/fill", fillApartsHandler).Methods("PUT")

	apartCRUD := apartRouter.PathPrefix("/{id}").Subrouter()
	apartCRUD.HandleFunc("/", crudHandler(getApart)).Methods("GET")
	apartCRUD.HandleFunc("/", crudHandler(deleteApart)).Methods("DELETE")
	apartCRUD.HandleFunc("/", crudHandler(scrap(createApart))).Methods("POST")
	apartCRUD.HandleFunc("/", crudHandler(scrap(updateApart))).Methods("PUT")

	http.Handle("/", r)
}

func getApartsHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := getAparts(c)
	response(w, aparts, e)
}

func updateAllApartsHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := updateAllAparts(c, NewApartScrapper(c))
	response(w, aparts, e)
}

func fillApartsHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := updateAparts(apartIDs, c, NewApartScrapper(c))
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
