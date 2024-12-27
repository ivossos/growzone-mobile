import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import SendIcon from "@/assets/icons/send.svg";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { colors } from "@/styles/colors";
import { getInitials, getUserName } from "@/lib/utils";
import { UserDTO } from "@/api/@types/models";

interface CommentInputProps {
  user: {
    image?: { image: string } | null;
    name?: string;
    username?: string;
  };
  newComment: string;
  setNewComment: (e: string) => void;
  handleCommentSubmit: () => Promise<void>;
  isLoadingAddComment: boolean;
}

const CommentInput = forwardRef(
  (
    {
      user,
      newComment,
      setNewComment,
      handleCommentSubmit,
      isLoadingAddComment,
    }: CommentInputProps,
    ref
  ) => {
  const [inputHeight, setInputHeight] = useState(48);
  const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef.current?.focus();
      },
    }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.inputWrapper}>
            <Avatar className="w-12 h-12 items-center border border-black-90 bg-black-70">
              {user?.image?.image ? (
                <AvatarImage
                  className="rounded-full"
                  source={{ uri: user.image.image }}
                />
              ) : (
                <AvatarFallback>
                  {getInitials(getUserName(user as UserDTO))}
                </AvatarFallback>
              )}
            </Avatar>

            <View style={styles.textInputContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { height: inputHeight }]}
                placeholder="Escreva um comentário..."
                placeholderTextColor={colors.black[30]}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                onContentSizeChange={(event) => {
                  const valueLenght = event.nativeEvent.contentSize.height;

                  setInputHeight(valueLenght);
                }}
              />
              <TouchableOpacity onPress={handleCommentSubmit}>
                {!isLoadingAddComment ? (
                  <SendIcon width={48} height={48} />
                ) : (
                  <ActivityIndicator
                    animating={isLoadingAddComment}
                    color="#fff"
                    size="small"
                    style={{ width: 48, height: 48 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 12,
    backgroundColor: colors.black[100],
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.black[80],
    borderRadius: 8,
    backgroundColor: colors.black[100],
  },
  input: {
    flex: 1,
    color: colors.brand.white,
    fontSize: 16,
    fontWeight: "500",
    maxHeight: 100,
  },
});

export default CommentInput;
