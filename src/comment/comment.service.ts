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
import { CommentDTO } from './comment.dto';
import { Comment } from './comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Collector)
    private readonly collectorRepository: Repository<Collector>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async findCommentsByAlbumId(albumId: number): Promise<CommentDTO[]> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['comments'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return album.comments;
  }

  async findCommentsByAlbumIdCommentId(
    albumId: number,
    commentId: number,
  ): Promise<CommentDTO> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['comments'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment)
      throw new BusinessLogicException(
        'The comment with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const commentalbum = album.comments.find((e) => e.id === comment.id);
    if (!commentalbum)
      throw new BusinessLogicException(
        'The comment is not associated to the album',
        BusinessError.NOT_FOUND,
      );

    return commentalbum;
  }

  async addCommentAlbum(
    albumId: number,
    commentDTO: CommentDTO,
  ): Promise<CommentDTO> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const collector = await this.collectorRepository.findOne({
      where: { id: commentDTO.collector.id },
    });
    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const { error } = validate(this.schema, commentDTO);
    if (error) {
      throw new BusinessLogicException(
        error.toString(),
        BusinessError.BAD_REQUEST,
      );
    } else {
      const comment = new Comment();
      comment.description = commentDTO.description;
      comment.rating = commentDTO.rating;
      comment.collector = collector;
      comment.album = album;

      return await this.commentRepository.save(comment);
    }
  }

  async updateComment(
    albumId: number,
    commentId: number,
    commentDTO: CommentDTO,
  ): Promise<CommentDTO> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['comments'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const collector = await this.collectorRepository.findOne({
      where: { id: commentDTO.collector.id },
    });
    if (!collector)
      throw new BusinessLogicException(
        'The collector with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment)
      throw new BusinessLogicException(
        'The comment with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const commentalbum = album.comments.find((e) => e.id === comment.id);
    if (!commentalbum)
      throw new BusinessLogicException(
        'The comment is not associated to the album',
        BusinessError.NOT_FOUND,
      );

    const { error } = validate(this.schema, commentDTO);
    if (error) {
      throw new BusinessLogicException(
        error.toString(),
        BusinessError.BAD_REQUEST,
      );
    } else {
      comment.description = commentDTO.description;
      comment.rating = commentDTO.rating;
      comment.collector = collector;

      return await this.commentRepository.save(comment);
    }
  }

  async deleteComment(albumId: number, commentId: number) {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['comments'],
    });
    if (!album)
      throw new BusinessLogicException(
        'The album with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment)
      throw new BusinessLogicException(
        'The comment with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    album.comments = album.comments.filter((e) => e.id !== comment.id);

    await this.commentRepository.remove(comment);

    return await this.albumRepository.save(album);
  }

  schema = Joi.object({
    description: Joi.string().required(),
    rating: Joi.number().greater(-1).less(6).required(),
    collector: Joi.any(),
  });
}
