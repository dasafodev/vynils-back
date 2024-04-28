import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Repository } from 'typeorm';
import { Album } from '../album/album.entity';
import { Collector } from '../collector/collector.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { validate } from '../shared/validation';
import { CollectorAlbumDTO } from './collectoralbum.dto';
import { CollectorAlbum } from './collectoralbum.entity';

@Injectable()
export class CollectorAlbumService {
  constructor(
    @InjectRepository(Collector)
    private readonly collectorRepository: Repository<Collector>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(CollectorAlbum)
    private readonly collectorAlbumRepository: Repository<CollectorAlbum>,
  ) {}

  async addAlbumToCollector(
    collectorId: number,
    albumId: number,
    collectorAlbumDTO: CollectorAlbumDTO,
  ): Promise<CollectorAlbumDTO> {
    const collector = await this.collectorRepository.findOne({
      where: { id: collectorId },
    });
    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const { error } = validate(this.schema, collectorAlbumDTO);
    if (error) {
      throw new BusinessLogicException(
        error.toString(),
        BusinessError.BAD_REQUEST,
      );
    } else {
      const collectoralbum = new CollectorAlbum();
      collectoralbum.price = collectorAlbumDTO.price;
      collectoralbum.status = collectorAlbumDTO.status;
      collectoralbum.album = album;
      collectoralbum.collector = collector;

      return await this.collectorAlbumRepository.save(collectoralbum);
    }
  }

  async findAlbumsByCollectorId(
    collectorId: number,
  ): Promise<CollectorAlbum[]> {
    const collector = await this.collectorRepository.findOne({
      where: { id: collectorId },
      relations: ['collectorAlbums'],
    });

    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const collectorAlbum = await this.collectorAlbumRepository.find({
      relations: ['album', 'collector'],
    });

    return collectorAlbum.filter((c) => c.collector.id == collectorId);
  }

  async findAlbumsByCollectorIdAlbumId(
    collectorId: number,
    albumId: number,
  ): Promise<CollectorAlbum[]> {
    const collector = await this.collectorRepository.findOne({
      where: { id: collectorId },
    });
    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const collectoralbum = await this.collectorAlbumRepository.find({
      relations: ['album', 'collector'],
    });

    return collectoralbum.filter(
      (c) => c.collector.id == collectorId && c.album.id == albumId,
    );
  }

  async updateAlbumCollector(
    collectorId: number,
    albumId: number,
    collectorAlbumDTO: CollectorAlbumDTO,
  ): Promise<CollectorAlbum> {
    const collector = await this.collectorRepository.findOne({
      where: { id: collectorId },
      relations: ['collectorAlbums'],
    });
    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const collectoralbum = await this.collectorAlbumRepository.findOne({
      // TODO: Revisar implementacion
      where: { id: collectorId, album: album },
      relations: ['album'],
    });
    const { error } = validate(this.schema, collectorAlbumDTO);

    if (error) {
      throw new BusinessLogicException(
        error.toString(),
        BusinessError.BAD_REQUEST,
      );
    } else {
      collectoralbum.price = collectorAlbumDTO.price;
      collectoralbum.status = collectorAlbumDTO.status;

      return await this.collectorAlbumRepository.save(collectoralbum);
    }
  }

  async deleteAlbumCollector(
    collectorId: number,
    albumId: number,
  ): Promise<CollectorAlbumDTO> {
    const collector = await this.collectorRepository.findOne({
      where: { id: collectorId },
      relations: ['collectorAlbums'],
    });
    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const collectoralbum = await this.collectorAlbumRepository.findOne({
      where: { id: collectorId, album: album },
      relations: ['album'],
    }); // { first: "Timber", last: "Saw" } } });

    if (!collectoralbum)
      throw new BusinessLogicException(
        'The album is not associated to the collector',
        BusinessError.NOT_FOUND,
      );

    return await this.collectorAlbumRepository.remove(collectoralbum);
  }

  schema = Joi.object({
    price: Joi.number().required(),
    status: Joi.string().valid('Active', 'Inactive').required(),
  });
}
