(ns com.kubelt.lib.kv-store.proto
  "A protocol for making peer-to-peer key-value store"
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"})

(defprotocol KVStore
  "A simple data-first HTTP client."            
  (query [this index]                            
            "Performs a value lookup on index")
  (store [this index value]                            
            "Perform a store operation "))

