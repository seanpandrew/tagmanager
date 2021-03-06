package model.command

import com.gu.tagmanagement.{PillarEvent, PillarEventType}
import model.{Pillar, PillarAudit}
import play.api.Logger
import repositories.{PillarAuditRepository, PillarRepository}
import services.{Contexts, KinesisStreams}

import scala.concurrent.Future


case class UpdatePillarCommand(pillar: Pillar) extends Command {

  type T = Pillar

  override def process()(implicit username: Option[String] = None): Future[Option[Pillar]] = Future{
    Logger.info(s"updating pillar ${pillar.id}")

    val result = PillarRepository.updatePillar(pillar)

    KinesisStreams.pillarUpdateStream.publishUpdate(pillar.id.toString, PillarEvent(PillarEventType.Update, pillar.id, Some(Pillar.asThrift(pillar))))

    PillarAuditRepository.upsertPillarAudit(PillarAudit.updated(pillar))

    result
  }(Contexts.tagOperationContext)
}
