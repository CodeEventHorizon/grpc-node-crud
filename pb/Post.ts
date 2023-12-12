// Original file: proto/post.proto

import type { Timestamp as _google_protobuf_Timestamp, Timestamp__Output as _google_protobuf_Timestamp__Output } from './google/protobuf/Timestamp';

export interface Post {
  'id'?: (string);
  'title'?: (string);
  'content'?: (string);
  'category'?: (string);
  'image'?: (string);
  'published'?: (boolean);
  'createdAt'?: (_google_protobuf_Timestamp | null);
  'updatedAt'?: (_google_protobuf_Timestamp | null);
}

export interface Post__Output {
  'id': (string);
  'title': (string);
  'content': (string);
  'category': (string);
  'image': (string);
  'published': (boolean);
  'createdAt': (_google_protobuf_Timestamp__Output | null);
  'updatedAt': (_google_protobuf_Timestamp__Output | null);
}
