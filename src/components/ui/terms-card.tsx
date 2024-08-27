import { Text, View } from "react-native";

type Term = {
  title?: string;
  description: string;
}
interface Data {
  title: string;
  terms: Term[]
}

interface Props {
  data: Data[]
}

export default function TermsCard({ data }: Props) {

  return (
    <View className="bg-black-90 rounded-lg">
      <View className="flex flex-col gap-4 p-6">
      {data.map(({title, terms}) => (
        <>
          <Text className="text-xl font-semibold text-white">{title}</Text>
          {terms.map(({ title, description }) => (
            <View key={title} className="flex flex-row items-start justify-start flex-wrap">
              {title && <Text className="text-lg font-medium text-white inline">{title}:</Text>}
              <Text className="text-lg font-normal text-black-30 inline whitespace-pre-wrap">{description}</Text>
            </View>
          ))}
          </>
      ))}
      </View>
    </View>
  )
}