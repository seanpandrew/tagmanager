package model

import play.api.libs.functional.syntax._
import play.api.libs.json.{JsValue, Json, JsPath, Format}
import scala.concurrent.{Future}

case class ClientConfig(capiUrl: String, capiKey: String, tagTypes: List[String], permissions: Map[String, Boolean])

object ClientConfig {

  implicit val clientConfigFormat: Format[ClientConfig] = (
    (JsPath \ "capiUrl").format[String] and
      (JsPath \ "capiKey").format[String] and
      (JsPath \ "tagTypes").format[List[String]] and
      (JsPath \ "permissions").format[Map[String, Boolean]]
    )(ClientConfig.apply, unlift(ClientConfig.unapply))
}