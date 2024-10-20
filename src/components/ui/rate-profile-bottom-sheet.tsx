import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Text, Keyboard, ActivityIndicator } from 'react-native';
import StarRating, { StarRatingDisplay } from 'react-native-star-rating-widget';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import { useBottomSheetContext } from '@/context/bottom-sheet-context';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from './button';
import Toast from 'react-native-toast-message';
import { Avatar, AvatarFallback } from '../Avatar';
import { formatDateIso, getInitials } from '@/lib/utils';
import { ReadReview, Review } from '@/api/@types/models';
import { getUserReviews } from '@/api/social/review/get-user-reviews';
import { FormField } from './form-field';
import { createReview } from '@/api/social/review/create-review';
import { updateReview as updateReviewApi } from '@/api/social/review/update-review';
import AnimatedSuccess from './animated-success';
import { DotIcon } from 'lucide-react-native';
import { readUserReview } from '@/api/social/review/read-user-review';
import { useAuth } from '@/hooks/use-auth';
import { FormFieldBottomSheetText } from './form-field-bottom-sheet';

interface RateProfileBottomSheetProps {
  onClose: () => void;
}

const validationSchema = z.object({
  rate: z.number().max(5),
  description: z.string().max(300, 'A avaliação pode ter no máximo 300 caracteres'),
});

const RateProfileBottomSheet = React.forwardRef<BottomSheet, RateProfileBottomSheetProps>(({ onClose }, ref) => {
  const { isVisible, userId, currentType, closeBottomSheet, openBottomSheet, callback } = useBottomSheetContext();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFetchReviews, setIsLoadingFetchReviews] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [review, setReview] = useState<ReadReview>();
  const [updateReview, setUpdateReview] = useState<ReadReview>();
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true); 

  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      rate: 0,
      description: '',
    }
  });

  const submit = async (values: z.infer<typeof validationSchema>) => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();

      if(updateReview) {
        await updateReviewApi({
          id: updateReview.reviewed_id,
          rate: values.rate,
          description: values.description,
        })
      } else {
        await createReview({
          userId: userId!,
          rate: values.rate,
          description: values.description,
        })
      }

      if(callback) await callback();

      setReportSubmitted(true);
      // Toast.show({
      //   type: 'success',
      //   text1: 'Sucesso',
      //   text2: 'Seus avaliação foi enviada com sucesso.',
      // });
      form.reset();
    } catch (err) {
      console.error('Erro ao enviar sua avaliação', err);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Erro ao enviar sua avaliação, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setReportSubmitted(false);
    setReview(updateReview ? updateReview : undefined);
    setUpdateReview(undefined);
    onClose();
    closeBottomSheet();
  };

  const handleCloseReportSubmitted = () => {
    form.reset();
    onClose();
    
    setTimeout(() => {
      setReportSubmitted(false);
      setReview(undefined);
      setUpdateReview(undefined);
      closeBottomSheet();
    }, 500)
  };

  const handleUpdateReview = (review: ReadReview) => {
    setUpdateReview(review);
    setReview(undefined);

    form.setValue('rate', review.value);
    form.setValue('description', review.content);
  };

  const convertToReview = (item: ReadReview): Review => {
    return {
      id: item.id,
      value: item.value,
      content: item.content,
      created_at: item.created_at,
      is_active: item.is_active,
      reviewer: {
        id: user.id,
        username: user.username,
        name: user.name,
        created_at: user.created_at,
        is_active: user.is_active,
        is_following: false,
      }
    }
  }

  const onChangeTypeBottomSheet = () => {
    if(userId) {
      openBottomSheet({ type: 'rate-profile', userId: userId})
    }
  } 

  const fetchReviews = useCallback(async () => {
    if (!userId || !hasMore || isLoadingFetchReviews) return;
  
    try {
      setIsLoadingFetchReviews(true);
      
      const data = await getUserReviews({ id: userId, skip, limit: 10 });
      
      setReviews(prevReviews => [...prevReviews, ...data]);
    
      setSkip(prevSkip => prevSkip + 10);
      
      if (data.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro buscar os reviews desse perfil, tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingFetchReviews(false);
    }
  }, [userId, skip, hasMore, isLoadingFetchReviews]);

  const loadMoreReviews = () => {
    if (!isLoadingFetchReviews && hasMore) {
      fetchReviews();
    }
  };

  const fetchReview = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoadingFetchReviews(true);
      const reviewData = await readUserReview(userId);
      setReview(reviewData);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro buscar os reviews desse perfil, tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingFetchReviews(false);
    }
  }, [userId]);

  useEffect(() => {
    if (currentType === 'reviews-profile' || currentType === 'rate-profile') { 
      if (!isLoadingFetchReviews && userId) {
        fetchReview();
        fetchReviews();
      }
    }
  }, [currentType, userId]);


  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />,
    []
  );

  const renderReview = (item: Review) => (
    <BottomSheetView key={item.id} className="flex flex-col gap-3 bg-black-100 mb-4 px-6">
      <BottomSheetView className="flex flex-row items-center gap-2">
        <Avatar className="bg-black-80 w-10 h-10">
          <AvatarFallback>{getInitials(item.reviewer.name || item.reviewer.username)}</AvatarFallback>
        </Avatar>
        <BottomSheetView className="flex flex-row items-center gap-1">
          <Text className="text-white text-base font-semibold">{item.reviewer.name || item.reviewer.username}</Text>
          <DotIcon className="w-3 h-3" color={colors.black[80]} />
          <Text className="text-brand-grey text-sm">{formatDateIso(item.created_at)}</Text>
        </BottomSheetView>
      </BottomSheetView>
      <StarRatingDisplay rating={item.value} starSize={16} color={colors.brand.green} emptyColor={colors.brand.grey}/>
      <Text className="text-start text-lg text-brand-grey">{item.content}</Text>
    </BottomSheetView>
  );

  const renderEmptyReview = () => (
    <BottomSheetView className="flex flex-col justify-center flex-1 gap-4 bg-black-100 mb-4 px-6">
      <Text className="text-center text-2xl text-brand-grey">{`${user.id === userId ? 'Você' : 'Esse perfil'} ainda não tem nenhuma avaliação.`}</Text>
      {user.id !== userId && <Button
        title="Fazer uma avaliação agora"
        handlePress={onChangeTypeBottomSheet}
      />}
    </BottomSheetView>
  );

  if (!isVisible || (currentType !== 'rate-profile' && currentType !== 'reviews-profile')) return null;

  return (
    <BottomSheet
      ref={ref}
      index={2}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100] }}
      backdropComponent={renderBackdrop}
      onClose={handleClose}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="none"
    >
      {currentType === 'rate-profile' && (reportSubmitted ? (
        <BottomSheetView className="flex flex-col items-center gap-14 p-6">
          <AnimatedSuccess />
          <Text className="text-3xl text-white font-semibold text-center">Agradecemos sua avaliação desse perfil!</Text>
          <Text className="text-base text-center text-brand-grey">
            Sua avaliação é útil para a comunidade ter uma melhor experiência e segurança nas relações.
          </Text>
          <Button
            title="Voltar para o perfil"
            handlePress={handleCloseReportSubmitted}
            containerStyles="w-full"
          />
          
        </BottomSheetView>
      ) : (
        <>
          {isLoadingFetchReviews && (
            <BottomSheetView className="flex flex-col justify-center items-center flex-1 py-6">
              <ActivityIndicator
                animating={isLoadingFetchReviews}
                color="#fff"
                size="small"
              />
            </BottomSheetView>
          )}
          {!isLoadingFetchReviews && review && 
            <BottomSheetView className="flex flex-col gap-14 py-6">
              <BottomSheetView className="flex flex-col items-center gap-1 w-full">
                <Text className="text-3xl text-white text-center font-semibold">Sua avaliação</Text>
                <Text className="text-base text-center text-brand-grey">Sua avaliação é útil para a comunidade.</Text>
              </BottomSheetView>
              <BottomSheetView className="flex flex-col items-start justify-start gap-1">
                {renderReview(convertToReview(review))}
              </BottomSheetView>
              <BottomSheetView className="px-6">
                <Button
                  title="Atualize sua avaliação"
                  handlePress={() => handleUpdateReview(review)}
                  containerStyles="w-full"
                />
              </BottomSheetView>
            </BottomSheetView>
          }
          {!isLoadingFetchReviews && !review && 
          <BottomSheetView className="flex flex-col items-center gap-14 p-6">
            <BottomSheetView className="flex flex-col items-center gap-1">
              <Text className="text-3xl text-white text-center font-semibold">{`${updateReview ? 'Atualize sua avaliação' : 'Avalie esse perfil' }`}</Text>
              <Text className="text-base text-center text-brand-grey">Sua avaliação é útil para a comunidade.</Text>
            </BottomSheetView>


            <Controller
              control={form.control}
              name="rate"
              render={({ field }) => (
                <StarRating
                  rating={field.value}
                  onChange={field.onChange}
                  maxStars={5}
                  color={colors.brand.green}
                  emptyColor={colors.brand.grey}
                  enableHalfStar={false}
                />
              )}
            />
            <TouchableOpacity onPress={() => Keyboard.dismiss()} className='w-full'>
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormFieldBottomSheetText
                    title="Sua avaliação"
                    placeholder="Descreva como foi sua experiência, a entrega, a qualidade do produto, entre outras coisas."
                    value={field.value}
                    handleChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    keyboardType="default"
                    multiline
                    numberOfLines={3}
                    containerStyles="h-40"
                  />
                )}
              />
            </TouchableOpacity>

            <Button
              title={`${updateReview ? 'Atualizar' : 'Salvar alterações' }`}
              handlePress={form.handleSubmit(submit)}
              isLoading={isLoading}
              containerStyles="w-full"
            />
          </BottomSheetView>
          }
          
        </>
      ))}

      {currentType === 'reviews-profile' && (
        isLoadingFetchReviews && reviews.length === 0 ? (
          <BottomSheetView className="flex flex-col justify-center items-center flex-1 py-6">
            <ActivityIndicator
              animating={isLoadingFetchReviews}
              color="#fff"
              size="small"
            />
          </BottomSheetView>
        ) : (
          <BottomSheetFlatList
            data={reviews}
            keyExtractor={(item) => 'key-' + item.id.toString()}
            renderItem={({ item }) => renderReview(item)}
            ListEmptyComponent={renderEmptyReview}
            ListFooterComponent={isLoadingFetchReviews ? (
              <BottomSheetView className="flex flex-col justify-center items-center flex-1 py-6">
                <ActivityIndicator
                  animating={isLoadingFetchReviews}
                  color="#fff"
                  size="small"
                />
              </BottomSheetView>
            ) : null}
            onEndReached={loadMoreReviews}
            onEndReachedThreshold={0.5} 
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )
      )}
    </BottomSheet>
  );
});

export default RateProfileBottomSheet;
