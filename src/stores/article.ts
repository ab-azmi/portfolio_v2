import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import type { Article } from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>()

  const selectedArticle = ref<Article>()

  const articleLength = computed(() => articles.value?.length)

  const getArticles = computed(() => articles.value)

  function readArticle(id: number): void {
    const article = articles.value?.find((article) => article.id === id)
    selectedArticle.value = article
  }

  async function fetchArticles(): Promise<void> {
    const { data } = await supabase.from('blogs').select()
    setArticles(data)
  }

  function setArticles(data: any): void {
    if (!data) return
    articles.value = data
  }

  async function createArticle(article: Article): Promise<void> {
    //upload image into supabase storage
    const imageName = article.image?.name + uuidv4()

    await supabase.storage
      .from('images')
      .upload('blogs/' + imageName, article.image, {
        cacheControl: '3600',
        upsert: false
      })
      .then((response) => {
        if (response.data) {
          //get link
          const { data } = supabase.storage.from('images').getPublicUrl(response.data.path)
          //save link into table
          article.image = data.publicUrl
          //upload article into supabase blogs table
          supabase.from('blogs').insert({
            title: article.title,
            content: article.content,
            image: article.image,
            tags: article.tags,
          })
          .then(() => {
            fetchArticles()
          })
        }
      })
  }

  function subscribeToArticles() {
    // Listen to all changes in the 'blogs' table
    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          schema: 'public',
          table: 'blogs',
          event: '*'
        },
        (payload) => {
          console.log('Change received!', payload)
          fetchArticles()
        }
      )
      .subscribe()
  }

  watch(
    getArticles,
    (articles) => {
      // persist the whole state to the local storage whenever it changes
      localStorage.setItem('articles', JSON.stringify(articles))
    },
    { deep: true }
  )

  return {
    articles,
    fetchArticles,
    articleLength,
    getArticles,
    setArticles,
    selectedArticle,
    readArticle,
    subscribeToArticles,
    createArticle
  }
})
