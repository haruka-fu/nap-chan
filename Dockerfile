FROM node:22-slim

# システムパッケージの更新とFFmpegのインストール
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    libtool \
    autoconf \
    pkg-config \
    libsodium-dev \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# タイムゾーンの設定
RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo "Asia/Tokyo" > /etc/timezone \
    && dpkg-reconfigure -f noninteractive tzdata

# コンテナ内の作業ディレクトリを設定
WORKDIR /usr/src/app

# プロジェクトの依存関係ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコンテナにコピー
COPY src ./src
COPY tsconfig.json ./

# TypeScriptをJavaScriptにコンパイル
RUN npx tsc && ls -l dist

# フォルダを作成
RUN mkdir -p /usr/src/app/tmp
RUN mkdir -p /usr/src/app/logs

# ボットを起動
CMD ["node", "dist/main.js"]
