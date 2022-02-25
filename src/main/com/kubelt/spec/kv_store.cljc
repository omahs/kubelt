(ns com.kubelt.spec.kv-store
  "Schema for Key Value store engine" 
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   [malli.core :as m]))

;; TODO test me

(def feed 
  :any)

(def key-encoding
  string?)

(def value-encoding
 string?) 


