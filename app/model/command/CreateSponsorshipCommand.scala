package model.command

import com.gu.tagmanagement.{SectionEvent, EventType, TagEvent}
import model._
import model.command.logic.SponsorshipStatusCalculator
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Format}
import repositories.SponsorshipOperations._
import repositories.{SponsorshipRepository, Sequences}
import services.KinesisStreams

case class CreateSponsorshipCommand(
  validFrom: Option[DateTime],
  validTo: Option[DateTime],
  sponsorshipType: String,
  sponsorName: String,
  sponsorLogo: Image,
  sponsorLink: String,
  tags: Option[List[Long]],
  section: Option[Long],
  targeting: Option[SponsorshipTargeting]
) extends Command {

  override type T = Sponsorship

  override def process()(implicit username: Option[String]): Option[T] = {

    val status = SponsorshipStatusCalculator.calculateStatus(validFrom, validTo)

    val sponsorship = Sponsorship(
      id = Sequences.sponsorshipId.getNextId,
      validFrom = validFrom,
      validTo = validTo,
      status = status,
      sponsorshipType = sponsorshipType,
      sponsorName = sponsorName,
      sponsorLogo = sponsorLogo,
      sponsorLink = sponsorLink,
      tags = tags,
      section = section,
      targeting = targeting
    )

    SponsorshipRepository.updateSponsorship(sponsorship).map { createdSponsorship =>

      if(status == "active") {
        for(
          tags <- createdSponsorship.tags;
          tagId <- tags
        ) {
          addSponsorshipToTag(createdSponsorship.id, tagId)
        }
        createdSponsorship.section foreach {sectionId => addSponsorshipToSection(createdSponsorship.id, sectionId)}
      }
      createdSponsorship
    }

  }
}

object CreateSponsorshipCommand{

  implicit val sponsorshipFormat: Format[CreateSponsorshipCommand] = (
      (JsPath \ "validFrom").formatNullable[DateTime] and
      (JsPath \ "validTo").formatNullable[DateTime] and
      (JsPath \ "sponsorshipType").format[String] and
      (JsPath \ "sponsorName").format[String] and
      (JsPath \ "sponsorLogo").format[Image] and
      (JsPath \ "sponsorLink").format[String] and
      (JsPath \ "tags").formatNullable[List[Long]] and
      (JsPath \ "section").formatNullable[Long] and
      (JsPath \ "targeting").formatNullable[SponsorshipTargeting]

    )(CreateSponsorshipCommand.apply, unlift(CreateSponsorshipCommand.unapply))

}
