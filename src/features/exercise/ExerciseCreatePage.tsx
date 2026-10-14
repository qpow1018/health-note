import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import ButtonLink from '@/components/common/button/ButtonLink'
import Input from '@/components/common/input/Input'
import { isYoutubeUrl } from './youtubeUrl'
import { createExercise } from './exerciseStorage'
import styles from './ExerciseCreatePage.module.scss'

type TLinkInput = { id: string; value: string }

function ExerciseCreatePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [links, setLinks] = useState<TLinkInput[]>(() => [{ id: crypto.randomUUID(), value: '' }])
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({})

  function handleAddLink() {
    setLinks([...links, { id: crypto.randomUUID(), value: '' }])
  }

  function handleRemoveLink(id: string) {
    setLinks(links.filter(link => link.id !== id))
    setLinkErrors(function clearError(previous) {
      const next = { ...previous }
      delete next[id]
      return next
    })
  }

  function handleLinkChange(id: string, value: string) {
    setLinks(links.map(link => link.id === id ? { ...link, value } : link))
    setLinkErrors(function clearError(previous) {
      const next = { ...previous }
      delete next[id]
      return next
    })
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const amount = String(formData.get('amount') ?? '').trim()
    const setsInput = String(formData.get('sets') ?? '').trim()
    const sets = setsInput === '' ? null : Number(setsInput)
    const memo = String(formData.get('memo') ?? '').trim()
    setError('')
    const invalidLinks: Record<string, string> = {}
    for (const link of links) {
      if (link.value.trim() && !isYoutubeUrl(link.value.trim())) {
        invalidLinks[link.id] = '유튜브 링크를 확인해 주세요. https://로 시작하는 전체 주소를 입력해 주세요.'
      }
    }
    setLinkErrors(invalidLinks)
    if (Object.keys(invalidLinks).length > 0) return
    const youtubeLinks = links.map(link => link.value.trim()).filter(Boolean)
    if (!name) {
      setError('운동 이름을 입력해 주세요.')
      return
    }
    if (sets !== null && (!Number.isSafeInteger(sets) || sets < 1)) {
      setError('세트는 1 이상의 정수로 입력해 주세요.')
      return
    }
    try {
      createExercise({ name, amount, sets, youtubeLinks, memo })
    } catch {
      setError('저장하지 못했어요. 브라우저 저장 공간과 기존 데이터를 확인하고 다시 시도해 주세요.')
      return
    }
    navigate('/exercise')
  }

  return (
    <section className={styles['exercise-create-page']}>
      <header className={styles['header']}>
        <Link className={styles['back-link']} to="/exercise">목록으로</Link>
        <h1>운동 등록</h1>
      </header>
      <form className={styles['form']} onSubmit={handleSubmit}>
        <div className={styles['field']}>
          <label htmlFor="exercise-name">운동 이름 <span>(필수)</span></label>
          <Input id="exercise-name" name="name" required placeholder="예: 푸시업" />
        </div>
        <div className={styles['amount-row']}>
          <div className={`${styles['field']} ${styles['amount-field']}`}>
            <label htmlFor="exercise-amount">운동량</label>
            <Input id="exercise-amount" name="amount" placeholder="예: 10회, 30초" aria-describedby="amount-hint" />
          </div>
          <div className={`${styles['field']} ${styles['sets-field']}`}>
            <label htmlFor="exercise-sets">세트 <span>(선택)</span></label>
            <Input id="exercise-sets" name="sets" type="number" inputMode="numeric" min="1" step="1" placeholder="예: 3" />
          </div>
        </div>
        <p id="amount-hint" className={styles['amount-hint']}>횟수나 시간을 원하는 방식으로 적어주세요.</p>
        <fieldset className={styles['links-field']}>
          <legend>유튜브 링크 <span>(선택)</span></legend>
          {links.map(function renderLink(link, index) {
            const inputId = `youtube-${link.id}`
            const errorId = `${inputId}-error`
            return (
              <div className={styles['link-item']} key={link.id}>
                <label className={styles['link-label']} htmlFor={inputId}>유튜브 링크 {index + 1}</label>
                <div className={styles['link-row']}>
                  <Input id={inputId} type="text" inputMode="url" autoCapitalize="none" spellCheck={false}
                    placeholder="https://youtu.be/..." value={link.value}
                    onChange={event => handleLinkChange(link.id, event.target.value)}
                    aria-invalid={Boolean(linkErrors[link.id])}
                    aria-describedby={linkErrors[link.id] ? errorId : undefined} />
                  {links.length > 1 && <Button color="gray" fill="outline"
                    aria-label={`유튜브 링크 ${index + 1} 삭제`} onClick={() => handleRemoveLink(link.id)}>삭제</Button>}
                </div>
                {linkErrors[link.id] && <p id={errorId} className={styles['link-error']} role="alert">{linkErrors[link.id]}</p>}
              </div>
            )
          })}
          <Button color="gray" fill="outline" onClick={handleAddLink}>링크 추가</Button>
        </fieldset>
        <div className={styles['field']}>
          <label htmlFor="exercise-memo">메모 <span>(선택)</span></label>
          <textarea id="exercise-memo" name="memo" rows={4} className={styles['memo']}
            placeholder="자세, 주의할 점 등 자유롭게 적어주세요." />
        </div>
        {error && <p className={styles['error']} role="alert">{error}</p>}
        <div className={styles['actions']}>
          <ButtonLink className={styles['action']} color="gray" fill="outline" to="/exercise">취소</ButtonLink>
          <Button className={styles['action']} type="submit" fill="solid">저장</Button>
        </div>
      </form>
    </section>
  )
}

export default ExerciseCreatePage
