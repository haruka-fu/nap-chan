FROM node:22-slim

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

# コマンドのセットアップを実行
RUN node dist/setupCommands.js

# ボットを起動
CMD ["node", "dist/main.js"]
