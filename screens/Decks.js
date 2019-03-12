import React, { Component } from 'react';
import { Text, Button, View, Modal, TextInput, Alert } from 'react-native';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import User from '../components/User'
import DeckList from '../components/DeckList'


const SIGNOUT_MUTATION = gql`
  mutation signout {
    signout {
      message
    }
  }
`;

const ALL_DECKS_QUERY = gql`
  query allDecks {
    allDecks {
      id
      slug
      name
      cardsTotal
      cardsDue
    }
  }
`;

const CREATE_DECK_MUTATION = gql`
  mutation createDeck($name: String!) {
    createDeck(data: { name: $name }) {
      slug
    }
  }
`;


const DELETE_DECK_MUTATION = gql`
  mutation deleteDeck($id: ID!) {
    deleteDeck(data: { id: $id }) {
      id
    }
  }
`;

export default class Decks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      newDeckName: ''
    }
  }

  toggleDialog = () => {
    this.setState({ dialogOpen: !this.state.dialogOpen }, () => console.log('dialog toggled!'));
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'My Decks',
      headerRight: <Mutation mutation={SIGNOUT_MUTATION}>{(signout, { client }) => (
        <Button title="Log out" onPress={() => {
          handleClick(signout, client);
          navigation.navigate('Home')
        }} />
      )}</Mutation>
    }
  };

  handleSubmit = async (createDeck) => {
    this.setState({ dialogOpen: !this.state.dialogOpen }, () => console.log('submit handled'));
    await createDeck({ variables: { name: this.state.newDeckName } }).then(data => console.log('promise data: ', data));
  };

  selectDeck = (id, deleteDeck) => {
    Alert.alert('Delete Deck', 'Are you sure you want to delete this deck? All cards will be deleted', 
    [ { text: 'OK', onPress: () =>  deleteDeck({ variables: {id: id}})}, { text: 'Cancel', onPress: () => console.log('Cancel pressed'), style: 'cancel'}]);
  }

  render() {
    return (
      <View>

        

        <Button onPress={this.toggleDialog} title="Create Deck" />

        <Modal visible={this.state.dialogOpen}
          onRequestClose={this.toggleDialog}
          transparent={true}
          animationType="slide"
        >
          <View style={{ height: 180, width: 250, margin: 50, padding: 15, backgroundColor: 'green' }}>
            <Text onPress={this.toggleDialog}>X</Text>
            <TextInput onChangeText={(newDeckName) => this.setState({ newDeckName })} value={this.state.newDeckName} placeholder="New Deck Name" style={{ height: 40 }} />
            <Mutation mutation={CREATE_DECK_MUTATION} refetchQueries={['allDecks']}>
              {(createDeck, { loading, error }) => (
                <Button onPress={() => this.handleSubmit(createDeck)} title='Save' />
              )}
            </Mutation>
          </View>
        </Modal>

        <User>
          {({ data }) => {

            if (data && data.me) {
              return <Query query={ALL_DECKS_QUERY}>

                {({ data }) => {
                  if (data.allDecks && data.allDecks.length > 0) {
                    console.log('you have decks')
                    return <Mutation mutation={DELETE_DECK_MUTATION} refetchQueries={['allDecks']}>
                      {(deleteDeck) => (
                        <DeckList decks={data.allDecks} deleteDeck={deleteDeck} selectDeck={this.selectDeck} navigate={this.props.navigation.navigate}/>
                      )}
                      
                      </Mutation>
                  } else {
                    console.log('you have no decks')
                    return <Text> Start your first deck! </Text>
                  }
                }}
              </Query>
            } else {
              return <Text>Loading…</Text>
            }
          }}
        </User>
      </View>
    )
  }
}

handleClick = async (signout, client) => {
  await signout();
  await client.resetStore();
}


