import React, { Component } from 'react'
import AppScreen from './AppScreen'
import { availableForMentoringFromVerifyTokenResponse, getParam } from './utils'
import { saveToken } from './persistence'
import { verifyToken } from './api'
import NextButton from './NextButton'

function getButtonInfo(isMentor, returningUser) {
  if (!isMentor) {
    return {
      buttonText: 'Browse profiles',
      linkUrl: '/browse'
    }
  }
  if (returningUser) {
    return {
      buttonText: 'Continue to home',
      linkUrl: '/'
    }
  }
  return {
    buttonText: 'Create profile',
    linkUrl: '/create-profile'
  }
}

const VerifiedView = props => {
  const {
    isMentor,
    returningUser,
    verified,
  } = props

  const { buttonText, linkUrl } = getButtonInfo(isMentor, returningUser)

  const welcomeMessage = returningUser
    ? `Successfully logged in as ${verified.email}.`
    : `Successfully verified ${verified.email}.`

  return (
    <div>
      <p>{welcomeMessage}</p>
      <div>
        {isMentor && (
          <iframe
            width="640px"
            height="360px"
            src="https://www.youtube.com/embed/6nAUk502ycA?modestbranding=1&rel=0"
            title="Weave tutorial video: How to create a faculty profile"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
      </div>
      <NextButton to={linkUrl} text={buttonText} />
    </div>
  )
}

export default class VerifyEmail extends Component {

  state = {
    error: null,
    verified: null,
    token: getParam('token'),
    profileId: null
  }

  async componentDidMount() {
    try {
      const response = await verifyToken(this.state.token)

      const isMentor = response.is_mentor
      const profileId = response.profile_id

      const availableForMentoring = availableForMentoringFromVerifyTokenResponse(
        response
      )

      this.setState({
        verified: response,
        profileId,
        isMentor,
        availableForMentoring
      })

      saveToken(this.state.token)

      this.props.authenticate({
        token: this.state.token,
        profileId,
        isMentor,
        availableForMentoring
      })
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        this.setState({
          error:
            'There was a problem with our server. Please try again in a moment.'
        })
        return
      }

      const errorMessage = err.token[0]
      if (errorMessage === 'not recognized') {
        this.setState({
          error: 'Your token is invalid. Try signing up or logging in again.'
        })
      } else if (errorMessage === 'expired') {
        this.setState({
          error: 'Your login token has expired. Try logging in again.'
        })
      }
    }
  }

  render() {
    const {
      error,
      isMentor,
      profileId,
      verified,
      token,
      availableForMentoring
    } = this.state

    const { authenticate, history } = this.props

    const errorView = error && <p>{error}</p>

    const returningUser = profileId !== null

    return (
      <AppScreen>
        <h1>Confirm email verification</h1>
        {errorView}
        {this.state.verified && (
          <VerifiedView
            isMentor={isMentor}
            returningUser={returningUser}
            verified={verified}
            authenticate={authenticate}
            history={history}
            token={token}
            profileId={profileId}
            availableForMentoring={availableForMentoring}
          />
        )}
      </AppScreen>
    )
  }
}
