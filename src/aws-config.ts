import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-1_pSHzX5rLJ',
      userPoolClientId: '2f9eq6fmr3vg5tss9aj8t0u7e5',
      identityPoolId: 'ap-northeast-1:0d2bd5be-126b-4718-b639-4806d1ba5821',
    },
  },
});
