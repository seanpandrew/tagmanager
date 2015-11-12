package model.command.logic

import model.command.CommandError._
import repositories.SectionRepository


object TagPathCalculator {

  def calculatePath(`type`: String, slug: String, sectionId: Option[Long]) = {

    val loadedSection = sectionId.map(SectionRepository.getSection(_).getOrElse(SectionNotFound))

    val sectionPathPrefix = loadedSection.map(_.wordsForUrl + "/").getOrElse("")

    `type` match {
      case "type" => s"type/$slug"
      case "tone" => s"tone/$slug"
      case "contributor" => s"profile/$slug"
      case "publication" => s"publication/$slug"
      case "series" => s"${sectionPathPrefix}series/$slug"
      case _ => sectionPathPrefix + slug
    }
  }

}
