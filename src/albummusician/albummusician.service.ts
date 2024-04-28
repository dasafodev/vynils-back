import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlbumDTO } from '../album/album.dto';
import { Album } from '../album/album.entity';
import { MusicianDTO } from '../musician/musician.dto';
import { Musician } from '../musician/musician.entity';
import { PerformerDTO } from '../performer/performer.dto';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class AlbumMusicianService {
  constructor(
    @InjectRepository(Musician)
    private readonly musicianRepository: Repository<Musician>,

    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  async addAlbumMusician(
    musicianId: number,
    albumId: number,
  ): Promise<AlbumDTO> {
    const musician = await this.musicianRepository.findOne({
      where: { id: musicianId },
    });
    if (!musician)
      throw new BusinessLogicException(
        'The musician with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['performers'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    album.performers = [...album.performers, musician];
    return await this.albumRepository.save(album);
  }

  async findMusiciansByAlbumIdMusicianId(
    musicianId: number,
    albumId: number,
  ): Promise<PerformerDTO> {
    const musician = await this.musicianRepository.findOne({
      where: { id: musicianId },
    });
    if (!musician)
      throw new BusinessLogicException(
        'The musician with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['performers'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const albummusician = album.performers.find((e) => e.id === musician.id);

    if (!albummusician)
      throw new BusinessLogicException(
        'The musician with the given id is not associated to the album',
        BusinessError.PRECONDITION_FAILED,
      );

    return albummusician;
  }

  async associateAlbumMusician(
    albumId: number,
    musicianDTO: MusicianDTO[],
  ): Promise<AlbumDTO> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['performers'],
    });

    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    let musicians: Musician[] = [];

    for (let i = 0; i < musicianDTO.length; i++) {
      const musician = await this.musicianRepository.findOne({
        where: { id: musicianDTO[i].id },
      });
      if (!musician)
        throw new BusinessLogicException(
          'The musician with the given id was not found',
          BusinessError.NOT_FOUND,
        );
      else musicians.push(musician);
    }

    album.performers = musicians;
    return await this.albumRepository.save(album);
  }

  async findMusiciansByAlbumId(albumId: number): Promise<PerformerDTO[]> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['performers'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return album.performers;
  }

  async deleteMusicianToAlbum(
    musicianId: number,
    albumId: number,
  ): Promise<AlbumDTO> {
    const musician = await this.musicianRepository.findOne({
      where: { id: musicianId },
    });
    if (!musician)
      throw new BusinessLogicException(
        'The musician with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['performers'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    album.performers = album.performers.filter((e) => e.id !== musicianId);

    return await this.albumRepository.save(album);
  }
}
