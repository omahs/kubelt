(ns com.kubelt.p2p.interceptor
  "Interceptors."
  {:copyright "©2022 Kubelt, Inc." :license "UNLICENSED"}
  (:import
    [goog.crypt Aes Arc4 Cbc Hmac Sha256 ])
  (:require
    [goog.object]
    [taoensso.timbre :as log])
  (:require
    [cljs.test :as t :refer [deftest is testing use-fixtures]]
    [clojure.string :as str])
  (:require
    [com.kubelt.p2p.handle-request :as p2p.handle-request]
    [com.kubelt.lib.jwt :as jwt]
    [com.kubelt.lib.http.status :as http.status]))


(defn- send-http-error [ctx status message] 
  (prn {:location "send-http-error" :message message})
  (-> ctx
      (assoc-in [:response :http/status] status)
      (assoc-in [:response :http/body] message)))

(def status-ok
  {:name ::status-ok
   :leave (fn [ctx]
            ;; If status is already set, nothing to do.
            (if-let [status (get-in ctx [:response :http/status])]
              ctx
              (assoc-in ctx [:response :http/status] http.status/ok)))})

(def status-no-content
  {:name ::status-no-content
   :leave (fn [ctx]
            ;; If status is already set, nothing to do.
            (if-let [status (get-in ctx [:response :http/status])]
              ctx
              (assoc-in ctx [:response :http/status] http.status/no-content)))})
(def user-namespace
  {:name ::user-namespace
   :enter (fn [ctx]
            (if (nil? (get ctx :error)) 
              (if-let [validated (js->clj (get-in ctx [:request :jwt/valid]) :keywordize-keys true)] 
                (if-let [pubkey (get-in  validated [:payload :pubkey])]
                  ((p2p.handle-request/set-user-namespace pubkey)
                   ctx)

                  (send-http-error ctx http.status/internal-server-error {:location "user-namespace" :message "Could not find public key"}))
                (send-http-error ctx http.status/unauthorized {:location "user-namespace" :message "Could not find valid authentication token"}))
              ctx))

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error :log/context ctx })
            ctx)})

(def validate-jwt
  {:name ::validate-jwt
   :enter (fn [ctx]
            ;; TODO extract and validate JWT. Throw an error to
            ;; interrupt chain processing if token is invalid.
            (if (nil? (get ctx :error)) 
              (if-let [payload (get ctx :body/raw)]
                (-> (p2p.handle-request/validate-jwt payload )
                    (.then (fn [x] 
                             (if (nil? x) 
                               (send-http-error ctx http.status/unauthorized {:location "validate-jwt" :message "Invalid JWT provided"})
                               (-> ctx
                                   (assoc-in [:request :jwt/raw] payload)
                                   (assoc-in [:request :jwt/valid] x))))

                           )
                    ((prn {:hereiam 2 :msg "unauth"})
                     (send-http-error ctx http.status/unauthorized {:location "validate-jwt" :message "invalid JWT payload"})))) 
              ctx))

   :error (fn [ctx]
            (let [error (get ctx :error)]
            (log/error {:log/error error})
            (let [ret (send-http-error ctx http.status/internal-server-error error)]
              (prn {:location "validate-jwt-error" :message ret})
            ret))
            )})
;; TODO check and throw error

(def register
  {:name ::register
   :enter (fn [ctx]
            ;; TODO register the user
            ctx)})

(def metrics
  {:name ::metrics
   :leave (fn [ctx]
            ;; TODO return accumulated metrics.
            ctx)})

(def version
  {:name ::version
   :leave (fn [ctx]
            (let [version "x.y.z"
                  body {:version version}]
              (assoc-in ctx [:response :http/body] body)))})

;; TODO confirm that an error in the promise chain triggers execution
;; of :error handler; otherwise use .catch().
(def kbt-resolve
  {:name ::kbt-resolve
   :enter (fn [ctx]
            (if (nil? (get ctx :error)) 
              (let [bee (get ctx :p2p/hyperbee)
                    match (get ctx :match)]
                (if-let  [kbt-name (get-in match [:path-params :id])]
                  ;; success
                  (let [kvresult (p2p.handle-request/kbt-resolve bee kbt-name)]
                    (-> kvresult
                        (.then (fn[x] 
                                 (if-not (nil? x)
                                   (assoc-in ctx [:response :http/body] x)
                                   ;; No result found, return a 404.
                                   (assoc-in ctx [:response :http/status] http.status/not-found))))))

                  ;; fail
                  (send-http-error ctx http.status/internal-server-error {:location kbt-resolve :message "Could not find name to query"})))
              ctx))

   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

;; TODO extract payload from JWT
(def kbt-update
  {:name ::kbt-update
   :enter (fn [ctx]
            (if (nil? (get ctx :error)) 
              (let [request (get ctx :request)
                    hyperbee (get ctx :p2p/hyperbee)
                    match (get ctx :match)
                    kbt-name (get-in match [:path-params :id])
                    jwt-json (get-in ctx [:request :jwt/valid])
                    valid-jwt (js->clj jwt-json :keywordize-keys true)
                    kbt-value  (get-in valid-jwt [:payload :endpoint])
                    update-result (p2p.handle-request/kbt-update hyperbee kbt-name kbt-value)]
                (if (nil? update-result)
                  ctx
                  (-> update-result
                      (.then (fn[x] 
                               (assoc-in ctx [:response :http/status] http.status/created))))))
              ctx))

   :leave (fn [ctx]
            (log/info {:log/msg "leaving kbt update"})
            ctx)
   :error (fn [{:keys [error] :as ctx}]
            (log/error {:log/error error})
            ctx)})

(def health-ready
  {:name ::health-ready
   :leave (fn [ctx]
            ;; TODO readiness check; set error status if problem.
            ctx)})

(def health-live
  {:name ::health-live
   :leave (fn [ctx]
            ;; TODO liveness check; set error status if problem.
            ctx)})
