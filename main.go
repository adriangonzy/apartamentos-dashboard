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
	apartRouter.HandleFunc("/", apartsHandler(aparts)).Methods("GET")
	apartRouter.HandleFunc("/", apartsHandler(updateAllAparts)).Methods("PUT")

	// only for testing
	apartRouter.HandleFunc("/fill", fillAparts).Methods("PUT")

	apartCRUD := apartRouter.PathPrefix("/{id}").Subrouter()
	apartCRUD.HandleFunc("/", apartHandler(getApart)).Methods("GET")
	apartCRUD.HandleFunc("/", apartHandler(deleteApart)).Methods("DELETE")
	apartCRUD.HandleFunc("/", apartHandler(scrap(createApart))).Methods("POST")
	apartCRUD.HandleFunc("/", apartHandler(scrap(updateApart))).Methods("PUT")

	http.Handle("/", r)
}

func apartsHandler(listFunc func(c appengine.Context) ([]*Apart, error)) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		c := appengine.NewContext(r)
		aparts, e := listFunc(c)
		if e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}
		serialize(w, aparts)
	}
}

func apartHandler(crudFunc func(id string, c appengine.Context) (*Apart, error)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		c := appengine.NewContext(r)
		vars := mux.Vars(r)
		id := vars["id"]
		apart, e := crudFunc(id, c)
		if e != nil {
			http.Error(w, e.Error(), http.StatusInternalServerError)
			return
		}
		serialize(w, apart)
	}
}

func fillAparts(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	aparts, e := updateAparts(apartIDs, c)
	if e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
		return
	}
	serialize(w, aparts)
}

func serialize(w http.ResponseWriter, v interface{}) {
	if e := json.NewEncoder(w).Encode(v); e != nil {
		http.Error(w, e.Error(), http.StatusInternalServerError)
	}
}
