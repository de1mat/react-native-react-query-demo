import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';

import { useInfiniteMovies } from '@app/screens/hooks/useInfiniteMovies';
import { Divider } from '@app/components/Divider';
import { MainStack } from '@app/navigation/types';
import { ListItem, LIST_ITEM_HEIGHT } from '@app/components/ListItem';
import { LIST_LEFT_SPACING } from '@app/styles/constants';
import { MovieFragment } from '@app/services/graphql';
import { useOnlineStatus } from '@app/providers/hooks/useOnlineStatus';
import { useRefreshOnFocus } from '@app/hooks/useRefreshOnFocus';
import { useRefreshByUser } from '@app/hooks/useRefreshByUser';
import { ListFooterComponent } from '@app/components/ListFooterComponent';

type MoviesListScreenNavigationProp = StackNavigationProp<
  MainStack,
  'MoviesList'
>;

type Props = {
  navigation: MoviesListScreenNavigationProp;
};

export function MoviesList({ navigation }: Props) {
  const theme = useTheme();
  const isOnline = useOnlineStatus();

  const { movies, refetch, fetchNextPage, isFetchingNextPage } =
    useInfiniteMovies();

  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  const onListItemPress = React.useCallback(
    (movie: MovieFragment) => {
      navigation.navigate('MovieDetails', {
        movie,
      });
    },
    [navigation]
  );

  function onEndReached() {
    console.log('onEndReached');
    fetchNextPage();
  }

  const renderItem = React.useCallback(
    ({ item }: { item: MovieFragment | null }) => {
      return <ListItem item={item} onPress={onListItemPress} />;
    },
    [onListItemPress]
  );

  return (
    <View style={[styles.fill]}>
      <FlatList
        refreshControl={
          isOnline ? (
            <RefreshControl
              refreshing={isRefetchingByUser}
              onRefresh={refetchByUser}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        data={movies}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={1}
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
        ItemSeparatorComponent={() => (
          <Divider
            style={{
              marginLeft: LIST_LEFT_SPACING,
            }}
          />
        )}
        ListFooterComponent={
          <ListFooterComponent isFetchingNextPage={isFetchingNextPage} />
        }
        getItemLayout={(_data, index) => ({
          length: LIST_ITEM_HEIGHT,
          offset: LIST_ITEM_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
