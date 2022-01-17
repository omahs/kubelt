(ns com.kubelt.cli.sdk.init
  "Invoke the SDK (init) method."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:require
   ["fs" :as fs]
   ["path" :as path])
  (:require
   [com.kubelt.sdk.v1 :as sdk]))

(defonce command
  {:command "init"
   :desc "Initialize the SDK"
   :requiresArg false

   :builder (fn [^Yargs yargs]
              yargs)

   :handler (fn [args]
              (let [kbt (sdk/init {:sdk/platform :platform/node})]
                (println "initializing the SDK")
                (prn kbt)
                (sdk/halt! kbt)))})
