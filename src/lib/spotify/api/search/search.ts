/**
 * Generated by orval v6.20.0 🍺
 * Do not edit manually.
 * Spotify Web API with fixes and improvements from sonallux
 * You can use Spotify's Web API to discover music and podcasts, manage your Spotify library, control audio playback, and much more. Browse our available Web API endpoints using the sidebar at left, or via the navigation bar on top of this page on smaller screens.

In order to make successful Web API requests your app will need a valid access token. One can be obtained through <a href="https://developer.spotify.com/documentation/general/guides/authorization-guide/">OAuth 2.0</a>.

The base URI for all Web API requests is `https://api.spotify.com/v1`.

Need help? See our <a href="https://developer.spotify.com/documentation/web-api/guides/">Web API guides</a> for more information, or visit the <a href="https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer">Spotify for Developers community forum</a> to ask questions and connect with other developers.

 * OpenAPI spec version: 2023.8.30
 */
import axios from 'axios'
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'
import useSwr from 'swr'
import type {
  Key,
  SWRConfiguration
} from 'swr'
import type {
  ForbiddenResponse,
  SearchItemsResponse,
  SearchParams,
  TooManyRequestsResponse,
  UnauthorizedResponse
} from '../../model'


  
  /**
 * Get Spotify catalog information about albums, artists, playlists, tracks, shows, episodes or audiobooks
that match a keyword string.<br />
**Note: Audiobooks are only available for the US, UK, Ireland, New Zealand and Australia markets.**

 * @summary Search for Item

 */
export const search = (
    params: SearchParams, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<SearchItemsResponse>> => {
    return axios.get(
      `https://api.spotify.com/v1/search`,{
    ...options,
        params: {...params, ...options?.params},}
    );
  }


export const getSearchKey = (params: SearchParams,) => [`https://api.spotify.com/v1/search`, ...(params ? [params]: [])] as const;

    
export type SearchQueryResult = NonNullable<Awaited<ReturnType<typeof search>>>
export type SearchQueryError = AxiosError<UnauthorizedResponse | ForbiddenResponse | TooManyRequestsResponse>

/**
 * @summary Search for Item

 */
export const useSearch = <TError = AxiosError<UnauthorizedResponse | ForbiddenResponse | TooManyRequestsResponse>>(
 params: SearchParams, options?: { swr?:SWRConfiguration<Awaited<ReturnType<typeof search>>, TError> & { swrKey?: Key, enabled?: boolean }, axios?: AxiosRequestConfig }

  ) => {

  const {swr: swrOptions, axios: axiosOptions} = options ?? {}

  const isEnabled = swrOptions?.enabled !== false
    const swrKey = swrOptions?.swrKey ?? (() => isEnabled ? getSearchKey(params) : null);
  const swrFn = () => search(params, axiosOptions);

  const query = useSwr<Awaited<ReturnType<typeof swrFn>>, TError>(swrKey, swrFn, swrOptions)

  return {
    swrKey,
    ...query
  }
}

