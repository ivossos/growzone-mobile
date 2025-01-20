import React, {
  forwardRef,
  Fragment,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Text,
  TextInputProps,
  Keyboard,
} from "react-native";
import SendIcon from "@/assets/icons/send.svg";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { colors } from "@/styles/colors";
import { getInitials, getUserName } from "@/lib/utils";
import { UserDTO } from "@/api/@types/models";
import { z } from "zod";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface CommentInputProps {
  user: {
    image?: { image: string } | null;
    name?: string;
    username?: string;
  };
  isFocus?: boolean;
  handleCommentSubmit: (value: { comment: string }) => Promise<void>;
  isLoadingAddComment: boolean;
}

export const CommentValidation = z.object({
  comment: z.string().nonempty("Campo obrigatório"),
});


const CommentInput = forwardRef(
  (
    { user, handleCommentSubmit, isLoadingAddComment, isFocus }: CommentInputProps,
    ref
  ) => {
    // const [isFocus, setIsFocus] = useState(false)

    const form = useForm({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
        comment: "",
      },
    });

    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        // setIsFocus(!isFocus)
        inputRef.current?.focus();
      },
    }));

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

          <View
            style={[
              styles.textInputBase,
              form.formState.errors?.["comment"]?.message
                ? styles.textInputErrorContainer
                : styles.textInputContainer,
            ]}
          >
            <Controller
              control={form.control}
              name="comment"
              render={({ field: { onChange, onBlur }, fieldState }) => (
                <BottomSheetTextInput
                  ref={inputRef as any}
                  style={styles.input}
                  placeholder="Escreva um comentário..."
                  placeholderTextColor={
                    fieldState.error?.message
                      ? colors.brand.error
                      : colors.black[30]
                  }
                  onChangeText={onChange}
                  multiline
                  autoFocus={isFocus}
                  numberOfLines={5}
                  onBlur={onBlur}
                />

              )}
            />
          </View>

          <View>
            <TouchableOpacity onPress={form.handleSubmit(handleCommentSubmit)}>
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

        {form.formState.errors?.["comment"]?.message && (
          <Text className="text-red-500 text-base font-medium ml-16">
            {form.formState.errors?.["comment"]?.message}
          </Text>
        )}
      </KeyboardAvoidingView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginBottom: Platform.OS === "android" ? 12 : 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInputBase: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.black[100],
  },
  textInputContainer: {
    borderColor: colors.black[80],
  },
  textInputErrorContainer: {
    borderColor: colors.brand.error,
  },
  input: {
    color: colors.brand.white,
    fontSize: 16,
    fontWeight: "500",
    maxHeight: 100,
    marginHorizontal: 6,
    marginBottom: 12,
    marginTop: 8,
  },
});

export default memo(CommentInput);
