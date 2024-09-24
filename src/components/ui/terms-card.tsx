import { Text, useWindowDimensions, View } from "react-native";
import RenderHtml, { HTMLSource } from 'react-native-render-html';

type Term = {
  title?: string;
  description: string;
}
interface Data {
  title: string;
  terms: Term[]
}

interface Props {
  html: string;
}

export default function TermsCard({ html }: Props) {
  const { width } = useWindowDimensions();

  const tagsStyles = {
    body: {color: '#fff'}
  };

  const source = { html };

  if(!html) return null;

  return (
    <View className="bg-black-90 rounded-lg">
      <View className="flex flex-col gap-4 p-6">
      <RenderHtml
        contentWidth={width}
        source={source}
        tagsStyles={tagsStyles}
      />
      </View>
    </View>
  )
}