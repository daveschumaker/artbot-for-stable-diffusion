'use client'

/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Link from 'next/link'
import { useStore } from 'statery'
import SpinnerV2 from 'app/_components/Spinner'
import PageTitle from 'app/_components/PageTitle'
import { userInfoStore } from 'app/_store/userStore'
import styles from './profile.module.css'
import { baseHost, basePath } from 'BASE_PATH'
import { IconRobot } from '@tabler/icons-react'

const ProfilePage = () => {
  const userState = useStore(userInfoStore)
  const {
    kudos_details,
    loggedIn,
    username,
    kudos,
    records = {},
    worker_ids = []
  } = userState

  // const fetchFirstJob = async () => {
  //   const data = await fetchFirstCompletedJob()
  //   console.log('data??', new Date(data.jobTimestamp))
  // }

  // useEffect(() => {
  //   fetchFirstJob()
  // }, [])

  if (loggedIn === null) {
    return (
      <>
        <Head>
          <title>User Profile - ArtBot for Stable Diffusion</title>
          <meta name="twitter:title" content="ArtBot - User Profile" />
          <meta
            name="twitter:image"
            content={`${baseHost}${basePath}/robot_profile.png`}
          />
        </Head>
        <PageTitle>User Profile</PageTitle>
        <SpinnerV2 />
      </>
    )
  }

  console.log(`userState?`, userState)

  if (loggedIn === false) {
    return (
      <>
        <Head>
          <title>User Profile - ArtBot for Stable Diffusion</title>
          <meta name="twitter:title" content="ArtBot - User Profile" />
          <meta
            name="twitter:image"
            content={`${baseHost}${basePath}/robot_profile.png`}
          />
        </Head>
        <PageTitle>User Profile</PageTitle>
        <div className="mb-[8px]">
          <Link href="/settings" className="text-cyan-500">
            Log into ArtBot
          </Link>{' '}
          with your{' '}
          <a
            href="https://aihorde.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500"
          >
            Stable Horde
          </a>{' '}
          API key to view detailed stats and information.
        </div>
        <div className="mb-[8px]">
          Don&apos;t have an API key? Register via{' '}
          <a
            href="https://aihorde.net/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500"
          >
            aihorde.net
          </a>
          .
        </div>
        <div>
          <div className="mb-[8px]">
            <strong>Why register?</strong>
          </div>
          Leave blank for anonymous access. An API key gives higher priority
          access to the Stable Horde distributed cluster, resulting in shorter
          image creation times.
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>User Profile - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - User Profile" />
        <meta
          name="twitter:image"
          content={`${baseHost}${basePath}/robot_profile.png`}
        />
      </Head>
      <PageTitle>User Profile</PageTitle>
      <div className="flex flex-row items-center gap-4 mb-[16px]">
        <div className={styles['profile-img']}>
          <IconRobot size={52} />
        </div>
        <div className="flex flex-col gap-[1px]">
          <div className="text-[16px]">Welcome back,</div>
          <div className="text-[24px] font-[700] mt-[-8px]">{username}</div>
        </div>
      </div>
      <div className={styles.section}>Stable Horde Stats</div>
      {loggedIn && (
        <>
          <div className={styles['info-wrapper']}>
            <div className={styles['info-wrapper-title']}>
              Currently Available Kudos
            </div>
            <div className={styles['info-wrapper-details']}>
              {kudos.toLocaleString()}
            </div>
          </div>
          <div className={styles['info-wrapper']}>
            <div className={styles['info-wrapper-title']}>
              Kudos gifted to you
            </div>
            <div className={styles['info-wrapper-details']}>
              {Math.abs(kudos_details.received).toLocaleString()}
            </div>
          </div>
          <div className={styles['info-wrapper']}>
            <div className={styles['info-wrapper-title']}>
              Kudos gifted to others
            </div>
            <div className={styles['info-wrapper-details']}>
              {Math.abs(kudos_details.gifted).toLocaleString()}
            </div>
          </div>
          {records.request && (
            <div className={styles['info-wrapper']}>
              <div className={styles['info-wrapper-title']}>
                Images you&apos;ve requested
              </div>
              <div className={styles['info-wrapper-details']}>
                {records.request.image.toLocaleString()}
              </div>
            </div>
          )}
          {records.fulfillment && (
            <div className={styles['info-wrapper']}>
              <div className={styles['info-wrapper-title']}>
                Images generated from your workers
              </div>
              <div className={styles['info-wrapper-details']}>
                {records.fulfillment.image.toLocaleString()}
              </div>
            </div>
          )}
          <div className={styles['info-wrapper']}>
            <div className={styles['info-wrapper-title']}>Your Workers</div>
            <div className={styles['info-wrapper-details']}>
              {worker_ids === null ? 0 : worker_ids.length.toLocaleString()}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ProfilePage
