import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class CommentOwnerGuard extends AuthGuard('jwt') {
  constructor(private commentsService: CommentsService) {
    super();
  }

  private readonly logger = new Logger(CommentOwnerGuard.name);

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthorizedException();

    const commentId = request.params.commentId;
    if (commentId) {
      const commentData = await this.commentsService.findOneComment(commentId);

      const isCommentOwner =
        commentData.user && commentData.user.userId === user.userId;

      if (isCommentOwner) return true;

      throw new ForbiddenException('You are not the owner of the comment');
    }
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error(`Authentication Error: ${err || info.message}`);
      throw err || new UnauthorizedException(info.message);
    }
    return user;
  }
}
