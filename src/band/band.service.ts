import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Repository } from 'typeorm';
import { Musician } from '../musician/musician.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { validate } from '../shared/validation';
import { BandDTO } from './band.dto';
import { Band } from './band.entity';

@Injectable()
export class BandService {
  constructor(
    @InjectRepository(Band)
    private readonly bandRepository: Repository<Band>,
    @InjectRepository(Musician)
    private readonly musicianRepository: Repository<Musician>,
  ) {}

  async findAll(): Promise<BandDTO[]> {
    return await this.bandRepository.find({
      relations: ['albums', 'musicians', 'performerPrizes'],
    });
  }

  async findOne(id: number): Promise<BandDTO> {
    const band = await this.bandRepository.findOne({
      where: { id },
      relations: ['albums', 'musicians', 'performerPrizes'],
    });
    if (!band)
      throw new BusinessLogicException(
        'The band with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    return band;
  }

  async create(bandDTO: BandDTO): Promise<BandDTO> {
    const { error } = validate(this.schema, bandDTO);

    if (error) {
      throw new BusinessLogicException(
        error.toString(),
        BusinessError.BAD_REQUEST,
      );
    } else {
      const band = new Band();
      band.name = bandDTO.name;
      band.image = bandDTO.image;
      band.description = bandDTO.description;
      band.creationDate = bandDTO.creationDate;
      return await this.bandRepository.save(band);
    }
  }

  async update(id: number, bandDTO: BandDTO): Promise<BandDTO> {
    const band = await this.bandRepository.findOne({
      where: { id },
    });
    if (!band)
      throw new BusinessLogicException(
        'The band with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    else {
      const { error } = validate(this.schema, bandDTO);
      if (error) {
        throw new BusinessLogicException(
          error.toString(),
          BusinessError.BAD_REQUEST,
        );
      } else {
        band.name = bandDTO.name;
        band.image = bandDTO.image;
        band.description = bandDTO.description;
        band.creationDate = bandDTO.creationDate;
        await this.bandRepository.save(band);
        return band;
      }
    }
  }

  async delete(id: number) {
    const band = await this.bandRepository.findOne({ where: { id } });
    if (!band)
      throw new BusinessLogicException(
        'The band with the given id was not found',
        BusinessError.NOT_FOUND,
      );
    return await this.bandRepository.remove(band);
  }

  schema = Joi.object({
    name: Joi.string().required(),
    image: Joi.string().uri(),
    description: Joi.string().required(),
    creationDate: Joi.date().required(),
  });
}
