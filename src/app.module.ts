import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album/album.entity';
import { AlbumModule } from './album/album.module';
import { AlbumBandModule } from './albumband/albumband.module';
import { AlbumMusicianModule } from './albummusician/albummusician.module';
import { AlbumstatusModule } from './albumstatus/albumstatus.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Band } from './band/band.entity';
import { BandModule } from './band/band.module';
import { BandAlbumModule } from './bandalbum/bandalbum.module';
import { BandmusicianModule } from './bandmusician/bandmusician.module';
import { Collector } from './collector/collector.entity';
import { CollectorModule } from './collector/collector.module';
import { CollectorAlbum } from './collectoralbum/collectoralbum.entity';
import { CollectorAlbumModule } from './collectoralbum/collectoralbum.module';
import { CollectorPerformerModule } from './collectorperformer/collectorperformer.module';
import { Comment } from './comment/comment.entity';
import { CommentModule } from './comment/comment.module';
import { GenreModule } from './genre/genre.module';
import { Musician } from './musician/musician.entity';
import { MusicianModule } from './musician/musician.module';
import { MusicianAlbumModule } from './musicianalbum/musicianalbum.module';
import { Performer } from './performer/performer.entity';
import { PerformerModule } from './performer/performer.module';
import { PerformerPrize } from './performerprize/performerprize.entity';
import { PerformerprizeModule } from './performerprize/performerprize.module';
import { Prize } from './prize/prize.entity';
import { PrizeModule } from './prize/prize.module';
import { RecordLabelModule } from './recordlabel/recordlabel.module';
import { Track } from './track/track.entity';
import { TrackModule } from './track/track.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        Album,
        CollectorAlbum,
        Band,
        Collector,
        Comment,
        Musician,
        Performer,
        PerformerPrize,
        Prize,
        Track,
      ],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
      migrations: [__dirname + '/migration/**/*{.ts,.js}'],
      migrationsRun: false,
    }),
    RecordLabelModule,
    PrizeModule,
    TrackModule,
    CollectorModule,
    PerformerModule,
    BandModule,
    MusicianModule,
    AlbumModule,
    GenreModule,
    CommentModule,
    CollectorAlbumModule,
    AlbumstatusModule,
    PerformerprizeModule,
    BandmusicianModule,
    MusicianAlbumModule,
    BandAlbumModule,
    CollectorPerformerModule,
    AlbumBandModule,
    AlbumMusicianModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
