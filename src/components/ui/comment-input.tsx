import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import SendIcon from '@/assets/icons/send.svg';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { colors } from '@/styles/colors';
import { getInitials } from '@/lib/utils';

interface CommentInputProps {
  user: {
    image?: { image: string } | null;
    name?: string;
    username?: string;
  };
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  handleCommentSubmit: () => Promise<void>;
  isLoadingAddComment: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({ user, newComment, setNewComment, handleCommentSubmit, isLoadingAddComment }) => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ width: '100%', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, backgroundColor: colors.black[100] }}>
        <View className="flex flex-row gap-2 items-center">
          <Avatar className="w-10 h-10 border border-black-90 bg-black-70">
            {user?.image?.image && <AvatarImage className="rounded-full" source={{ uri: user.image.image }} />}
            <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
          </Avatar>

          <View className="flex flex-row flex-1 items-center h-12 justify-between border border-black-80 rounded-lg px-4">
            <TextInput
              className="text-white text-start font-medium text-base w-max"
              style={{ color: colors.brand.white }}
              placeholder="Escreva um comentário..."
              placeholderTextColor={colors.black[30]}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={handleCommentSubmit}>
              {!isLoadingAddComment ? (
                <SendIcon width={48} height={48} />
              ) : (
                <ActivityIndicator animating={isLoadingAddComment} color="#fff" size="small" className="w-12 h-12" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentInput;
