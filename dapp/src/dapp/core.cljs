(ns dapp.core
  (:require
    [com.kubelt.sdk.v1 :as sdk.v1]
    [reagent.dom :as rdom]
    [re-frame.core :as re-frame]
    [dapp.config :as config]
    [dapp.views :as views]
    [dapp.routes :as routes]))

(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel {:router routes/router}] root-el)))

;;; Effects ;;;

(def kubelt-db
  {:sdk/ctx {}
   :web3-modal nil})

;;; Events ;;;

(re-frame/reg-event-db
 ::initialize-db
 (fn [_db _]
   (let [ctx (sdk.v1/init)]
     (merge
      kubelt-db
      {:sdk/ctx ctx}))))

(re-frame/reg-sub
 ::db
 (fn [db]
   db))

(defn ^:export init []
  (re-frame/clear-subscription-cache!)
  (re-frame/dispatch-sync [::initialize-db])
  (dev-setup)
  (routes/init-routes!)
  (mount-root))
