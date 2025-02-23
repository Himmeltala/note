import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/note/dist",
  plugins: [
    vue(),
    vueJsx(),
    UnoCSS({
      configFile: "./uno.config.ts"
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: [
        "vue",
        "@vueuse/core",
        { "@/utils/index": ["Utils"] },
        { "@/constants/index": ["Const"] },
        { "@/database/index": ["Database"] }
      ]
    }),
    Components({
      dirs: ["./src/components/**", "./src/fragments/**"]
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: ``
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
