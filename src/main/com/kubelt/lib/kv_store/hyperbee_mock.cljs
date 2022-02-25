(ns com.kubelt.lib.kv-store.hyperbee-mock
  "Hyperbee for production"
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
    ;; hyperbee
   [taoensso.timbre :as log])
  (:require 
    [com.kubelt.lib.kv-store.proto :as kv-store.proto]))
(defrecord Hyperbee [feed options]
  kv-store.proto/KVStore
  (query [_ index] "hereiam")
  (store [_ index value] "hereiam"))


#_(defrecord HyperbeeMock [feed options]
  p2p.proto.KVStore
  (store [_ index value]
    (js/Promise.resolve "fixme" ))
  (query [_ index]
    (js/Promise.resolve #js {"value" "sup"})
    ))

