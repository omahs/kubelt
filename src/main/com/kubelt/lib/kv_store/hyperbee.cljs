(ns com.kubelt.lib.kv-store.hyperbee
  "Hyperbee for production"
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
    ;; hyperbee
    ["hyperbee" :as hyperbee]
   [taoensso.timbre :as log])
  (:require 
    [com.kubelt.lib.kv-store.proto :as kv-store.proto]))

(defrecord Hyperbee [feed options]
  kv-store.proto/KVStore
  (store [_ index value])
  (query [_ index]))

