package dashboard

import (
	"appengine"
	"net/http"
	"time"
)

func recoverHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				appengine.NewContext(r).Errorf("panic: %v", err)
				http.Error(w, http.StatusText(500), 500)
			}
		}()
		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}

func loggingHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		t1 := time.Now()
		next.ServeHTTP(w, r)
		t2 := time.Now()
		appengine.NewContext(r).Infof("[%s] %q %v\n", r.Method, r.URL.String(), t2.Sub(t1))
	}

	return http.HandlerFunc(fn)
}
