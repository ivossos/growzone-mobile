import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetFooter } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import { useBottomSheetContext } from '@/context/bottom-sheet-context';
import { getPostComments } from '@/api/social/post/comment/get-comments';
import Toast from 'react-native-toast-message';
import { Comment } from '@/api/@types/models';
import CommentCard from './comment-card';
import Loader from './loader';
import { Text, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import createComment from '@/api/social/post/comment/create-comment';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import CommentInput from './comment-input';

const CommentBottomSheet = React.forwardRef<BottomSheet>((_, ref) => {
  const { user } = useAuth();
  const [skip, setSkip] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingAddComment, setIsLoadingAddComment] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState('');

  const { postId, isVisible, currentType, closeBottomSheet } = useBottomSheetContext();

  const snapPoints = useMemo(() => ['50%', '70%', '90%'], []);

  const loadPostComments = async (isLoadMore = false) => {
    try {
      if (!postId || loading) return;
      setLoading(true);
      const limit = 10;
      const data = await getPostComments({ postId, skip, limit });
     
      if (data.length < limit) {
        setHasMore(false);
      }

      setComments((prev) => isLoadMore ? [...prev, ...data] : data);
      if (data.length > 0) {
        setSkip((prev) => prev + limit);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Erro ao buscar comentários. Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setComments([]);
    setSkip(0);
    setHasMore(true);
    setNewComment('');
    closeBottomSheet();
  };

  const handleCommentSubmit = useCallback(async () => {
    if (newComment.trim()) {
      try {
        setIsLoadingAddComment(true);
        const res = await createComment({ postId: postId!, content: newComment });
        const comment = {
          id: res.id,
          content: res.content,
          like_count: 0,
          reply_count: 0,
          created_at: res.created_at,
          user: { ...user, is_following: false },
          is_liked: false
        } as Comment
        setComments((prev) => [...[comment], ...prev])
        setNewComment('');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Opss',
          text2: 'Aconteceu um erro ao enviar seu comentário.',
        });
      } finally {
        setIsLoadingAddComment(false);
      }
    } else {
      Toast.show({
        type: 'info',
        text1: 'Opss',
        text2: 'Você precisa digitar um comentário.',
      });
    }
  }, [newComment, postId]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPostComments(true);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => <CommentCard comment={item} />,
    []
  );

  const renderFooter = useCallback(
    (props: BottomSheetDefaultFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <CommentInput
          user={user}
          newComment={newComment}
          setNewComment={setNewComment}
          handleCommentSubmit={handleCommentSubmit}
          isLoadingAddComment={isLoadingAddComment}
        />
      </BottomSheetFooter>
    ),
    [user, newComment, isLoadingAddComment] 
  );

  useEffect(() => {
    if (postId && isVisible) {
      setSkip(0);
      setComments([]);
      setHasMore(true);
      loadPostComments();
    }
  }, [postId, isVisible]);

  return isVisible && currentType === 'comment' ? (
    <BottomSheet
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100] }}
      backdropComponent={renderBackdrop}
      onClose={handleClose}
      footerComponent={renderFooter}
      keyboardBehavior="fillParent"
    >
      <BottomSheetFlatList
        data={comments}
        className="h-full p-6"
        contentContainerClassName={'mb-80'}
        keyExtractor={(item) => 'key-' + item.id + item.created_at}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex flex-col justify-center items-center flex-1 py-10">
            <Text className="font-medium text-white text-lg">Nenhum comentário nessa postagem</Text>
          </View>
        }
        onEndReached={handleLoadMore}
      />
      <Loader isLoading={loading} />
    </BottomSheet>
  ) : null;
});

export default memo(CommentBottomSheet);
