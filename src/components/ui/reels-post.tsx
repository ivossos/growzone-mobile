import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions, TouchableOpacity, Platform } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, AvatarImage } from "../Avatar";
import { Heart, MessageCircleMore } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { useFocusEffect } from "expo-router";
import ExpandableText from "./expandable-text";
type Post = {
  id: string;
  video: string;
  caption: string;
  userInfo: {
    id: number;
    name: string;
    avatar: string;
    isFollowing: boolean;
  };
};

type ReelsPostProps = {
  post: Post;
  activePostId: string;
  openComment: (post: Post) => void;
};

const ReelsPost = ({ post, activePostId, openComment }: ReelsPostProps) => {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
 
  const isPlaying = status?.isLoaded && status.isPlaying;
  const isBuffering = status?.isLoaded && status.isBuffering;

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (video.current) {
          video.current.stopAsync();
        }
      };
    }, [])
  );

  useEffect(() => {
    if (!video.current) return;

    if (activePostId !== post.id) {
      video.current.pauseAsync().then(() => {
        video.current?.setStatusAsync({ shouldPlay: false });
      });
    } else {
      //video.current.playAsync();
    }
  }, [activePostId, post.id]);

  const onPress = () => {
    if (!video.current) return;

    if (isPlaying) {
      video.current.pauseAsync().then(() => {
        video.current?.setStatusAsync({ shouldPlay: false });
      });
    } else {
      video.current.playAsync().then(() => {
        video.current?.setStatusAsync({ shouldPlay: true });
      });
    }
  };

  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets(); 

  const videoHeight = height - top - bottom;
  const additionalHeight = Platform.OS === 'ios' ? 10 : 0;

  return (
    <View style={[styles.container, { height: videoHeight + additionalHeight }]}>
      <Video
        ref={video}
        style={[StyleSheet.absoluteFill, styles.video]}
        source={{ uri: post.video }}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={setStatus}
        isLooping
        isMuted={false}
        onError={(error) => console.error("Video Error:", error)}
      />

      <Pressable onPress={onPress} style={styles.content}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={[StyleSheet.absoluteFillObject, styles.overlay]}
        />
        {!isPlaying && !isBuffering && (
          <Ionicons
            style={{ position: "absolute", alignSelf: "center", top: "50%" }}
            name="play"
            size={70}
            color="rgba(255, 255, 255, 0.6)"
          />
        )}
        {isBuffering && (
          <ActivityIndicator
            style={{ position: "absolute", alignSelf: "center", top: "50%" }}
            size="large"
            color="#FFFFFF"
          />
        )}
        
          <View style={styles.footer}>
            <View style={{ flex: 1 }} className="flex gap-2">
              <View
                key={post.userInfo.id}
                className="flex flex-row items-center justify-start w-full"
              >
                <View className="flex flex-row items-center gap-2 mr-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      className="rounded-full"
                      src={post.userInfo.avatar}
                    />
                  </Avatar>
                  <View>
                    <Text className="text-white text-lg text-start font-semibold">
                      {post.userInfo.name}
                    </Text>
                  </View>
                </View>

                {post.userInfo.isFollowing ? (
                  <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px] ">
                    <Text className="text-base text-neutral-400">Seguindo</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px] ">
                    <Text className="text-base text-brand-green ">
                      + Seguir
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <ExpandableText text={post.caption} numberOfLines={1} />
            </View>

            <View style={styles.rightColumn}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
                style={styles.blurContainer}
              >
                <TouchableOpacity onPress={() => {}}>
                  <Heart size={20} color={colors.brand.white} />
                </TouchableOpacity>
              </LinearGradient>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
                style={styles.blurContainer}
              >
                <TouchableOpacity onPress={() => openComment(post)}>
                  <MessageCircleMore size={20} color={colors.brand.white} />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    padding: 12,
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.32)",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  container: {
    flex: 1
  },
  video: {},
  content: {
    flex: 1,
    padding: 24,
  },
  overlay: {
    top: "50%",
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
  },
  rightColumn: {
    gap: 16,
  },
});

export default memo(ReelsPost);
